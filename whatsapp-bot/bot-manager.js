const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const CODES_FILE = path.join(__dirname, 'subscription_codes.json');
const PAIRING_FILE = path.join(__dirname, '..', 'public', 'pairing.json');
const LOG_FILE = path.join(__dirname, 'bot.log');

let userStates = {};
let ownerChatActive = {};
let botConnected = false;
let sock = null;
let presenceInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 10;

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  console.log(line.trimEnd());
  try { fs.appendFileSync(LOG_FILE, line); } catch {}
}

function writePairingStatus(data) { try { fs.writeFileSync(PAIRING_FILE, JSON.stringify(data)); } catch {} }
function loadCodes() { try { if (fs.existsSync(CODES_FILE)) return JSON.parse(fs.readFileSync(CODES_FILE, 'utf-8')); } catch {} return {}; }
function saveCodes(codes) { try { fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2)); } catch {} }

function generateCode(phone) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const last4 = phone.replace(/\D/g, '').slice(-4);
  let code; const codes = loadCodes();
  do { code = `${letters[Math.floor(Math.random()*26)]}${letters[Math.floor(Math.random()*26)]}${letters[Math.floor(Math.random()*26)]}${last4}${Math.floor(Math.random()*10)}`; } while (codes[code]);
  return code;
}

async function saveSubscriptionToDB(code, phone) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try { await prisma.subscription.create({ data: { code, phone, isActive: false } }); }
    catch (e) { const c = loadCodes(); c[code] = { phone, createdAt: new Date().toISOString(), activated: false }; saveCodes(c); }
    finally { await prisma.$disconnect(); }
  } catch (e) {
    log('DB error, fallback to JSON: ' + e.message);
    const c = loadCodes(); c[code] = { phone, createdAt: new Date().toISOString(), activated: false }; saveCodes(c);
  }
}

const WELCOME = `مرحباً بك في OptiSize! 👁️

كيف يمكنني مساعدتك؟

1️⃣ اشتراك - اشترك في مركز صحة العين VIP
2️⃣ تحدث - تحدث مع فريق الدعم

أرسل الرقم أو الكلمة 👇`;

const SUB_INFO = `💎 اشتراك مركز صحة العين VIP

قيمة الاشتراك: 50 جنيه شهرياً

💰 طريقة الدفع:
حول 50 جنيه على رقم فودافون كاش:
📱 01028900122

بعد الدفع أرسل صورة تأكيد الدفع هنا ✅`;

const PAY_CONFIRM = `📸 أرسل صورة تأكيد الدفع الآن

ملاحظة: تأكد أن الصورة توضح:
- الرقم المحول ليه (01028900122)
- المبلغ (50 جنيه)
- تاريخ ووقت التحويل`;

async function setOnline() {
  if (!sock || !botConnected) return;
  try { await sock.sendPresenceUpdate('available'); } catch {}
}

function startPresenceKeepAlive() {
  if (presenceInterval) clearInterval(presenceInterval);
  setOnline();
  presenceInterval = setInterval(setOnline, 45000);
}

function stopPresenceKeepAlive() {
  if (presenceInterval) { clearInterval(presenceInterval); presenceInterval = null; }
}

async function safeSend(jid, content) {
  if (!sock || !botConnected) return false;
  try { await sock.sendMessage(jid, content); return true; }
  catch (e) { log('Send failed: ' + e.message); return false; }
}

async function startWA() {
  log('Starting WhatsApp connection...');
  try {
    const { version } = await fetchLatestBaileysVersion();
    const authPath = path.join(__dirname, 'auth_info');
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    sock = makeWASocket({
      version, auth: state,
      printQRInTerminal: false,
      browser: ['OptiSize Bot', 'Chrome', '1.0'],
      markOnlineOnConnect: true,
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 25000,
      emitOwnEvents: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        botConnected = false;
        try {
          const qrPath = path.join(__dirname, '..', 'public', 'whatsapp-qr.png');
          await QRCode.toFile(qrPath, qr, { width: 400, margin: 2 });
          writePairingStatus({ status: 'ready', qrAvailable: true });
          log('QR saved');
        } catch (e) { writePairingStatus({ status: 'ready' }); }
      }
      if (connection === 'close') {
        botConnected = false;
        stopPresenceKeepAlive();
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        log('Connection closed. Status=' + statusCode + ' Reconnect=' + shouldReconnect);
        if (shouldReconnect && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          setTimeout(startWA, Math.min(3000 * reconnectAttempts, 30000));
        } else if (statusCode === DisconnectReason.loggedOut) {
          writePairingStatus({ status: 'logged_out' });
          reconnectAttempts = 0;
        }
      }
      if (connection === 'open') {
        botConnected = true;
        reconnectAttempts = 0;
        log('WhatsApp CONNECTED!');
        writePairingStatus({ status: 'connected' });
        startPresenceKeepAlive();
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        if (type !== 'notify' && type !== 'append') return;
        const m = messages[0];
        if (!m || m.key.fromMe) return;

        const from = m.key.remoteJid;
        if (from.endsWith('@g.us')) return; // Ignore groups
        if (!from.endsWith('@s.whatsapp.net')) return; // Only DMs

        const phone = from.replace('@s.whatsapp.net', '');
        const text = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || '';
        log(`DM from ${phone}: ${text || '[IMAGE]'}`);

        try { await sock.readMessages([m.key]); } catch {}
        try { await sock.sendPresenceUpdate('composing', from); } catch {}
        await new Promise(r => setTimeout(r, 800));

        if (ownerChatActive[phone]) {
          if (text.trim() === 'انتهى' || text.trim() === 'انهى') {
            ownerChatActive[phone] = false;
            await safeSend(from, { text: 'شكراً! 🙏' });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }

        if (m.message?.imageMessage) {
          if (userStates[phone] === 'awaiting_receipt') {
            await handleReceipt(from, phone, m);
          } else {
            await safeSend(from, { text: WELCOME });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }

        const cmd = text.trim();
        if (cmd === '1' || cmd === 'اشتراك' || cmd === 'اشترك') {
          userStates[phone] = 'awaiting_receipt';
          await safeSend(from, { text: SUB_INFO });
          await new Promise(r => setTimeout(r, 1000));
          await safeSend(from, { text: PAY_CONFIRM });
        } else if (cmd === '2' || cmd === 'تحدث') {
          ownerChatActive[phone] = true;
          await safeSend(from, { text: '👤 تم تحويلك لفريق الدعم.\nلإنهاء المحادثة أرسل: انتهى' });
        } else {
          await safeSend(from, { text: WELCOME });
        }
        try { await sock.sendPresenceUpdate('available'); } catch {}
      } catch (err) {
        log('Message handler error: ' + err.message);
      }
    });

  } catch (err) {
    log('startWA error: ' + err.message);
    botConnected = false;
    if (reconnectAttempts < MAX_RECONNECT) {
      reconnectAttempts++;
      setTimeout(startWA, Math.min(5000 * reconnectAttempts, 60000));
    }
  }
}

async function handleReceipt(from, phone, msg) {
  await safeSend(from, { text: '⏳ جاري المراجعة...' });
  try {
    const buf = await sock.downloadMediaMessage(msg);
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      const b64 = buf.toString('base64');
      const r = await zai.chat.completions.create({
        messages: [{ role: 'user', content: [
          { type: 'text', text: `تحقق من إيصال الدفع:\n1. الرقم 01028900122؟ (نعم/لا)\n2. المبلغ 50 جنيه؟ (نعم/لا)\n3. تاريخ/وقت؟ (نعم/لا)\n4. تم الدفع؟ (نعم/لا)\n5. النتيجة: مقبول/مرفوض\nبالعربية باختصار.` },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } }
        ]}]
      });
      const a = r.choices[0]?.message?.content || '';
      if (a.includes('مقبول') && !a.includes('مرفوض')) {
        const code = generateCode(phone);
        await saveSubscriptionToDB(code, phone);
        userStates[phone] = 'idle';
        await safeSend(from, { text: `✅ تم التأكيد!\n\n🔑 الكود: ${code}\n\nأدخله في OptiSize في مركز صحة العين\n⏰ صالح شهر\nشكراً! 🙏` });
      } else {
        await safeSend(from, { text: '❌ غير مقبول. حاول تاني بصورة أوضح.' });
      }
    } catch (aiErr) {
      log('AI verification failed: ' + aiErr.message);
      const code = generateCode(phone);
      await saveSubscriptionToDB(code, phone);
      userStates[phone] = 'idle';
      await safeSend(from, { text: `✅ تم استلام الدفع!\n\n🔑 الكود: ${code}\n\nأدخله في OptiSize في مركز صحة العين\n⏰ صالح شهر\nشكراً! 🙏` });
    }
  } catch (e) {
    log('Receipt error: ' + e.message);
    await safeSend(from, { text: '⚠️ خطأ في معالجة الصورة. حاول تاني.' });
  }
}

process.on('uncaughtException', (err) => {
  log('Uncaught: ' + err.message);
});

process.on('unhandledRejection', (reason) => {
  log('Unhandled Rejection: ' + reason);
});

// ====== Export for use in Next.js API ======
function getStatus() {
  return { connected: botConnected, uptime: process.uptime() };
}

async function requestPairingCode() {
  if (botConnected) return { status: 'connected' };
  if (!sock) return { status: 'error', message: 'No connection' };
  try {
    const code = await sock.requestPairingCode('201028900122');
    const fmt = code?.match(/.{1,4}/g)?.join('-') || code;
    writePairingStatus({ status: 'pairing', code: fmt });
    return { status: 'pairing', code: fmt };
  } catch (e) { return { status: 'error', message: e.message }; }
}

module.exports = { startWA, getStatus, requestPairingCode, log };

// If run directly (not imported), start the bot and HTTP API
if (require.main === module) {
  log('Bot starting as standalone...');
  const http = require('http');
  http.createServer(async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    if (req.url === '/status') { res.end(JSON.stringify(getStatus())); return; }
    if (req.url === '/request-code') { res.end(JSON.stringify(await requestPairingCode())); return; }
    if (req.url === '/log') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      try { res.end(fs.readFileSync(LOG_FILE, 'utf-8').slice(-3000)); } catch { res.end('No logs'); }
      return;
    }
    res.end(JSON.stringify({ status: 'ok' }));
  }).listen(8787, '0.0.0.0', () => { log('API on :8787'); startWA(); });
}
