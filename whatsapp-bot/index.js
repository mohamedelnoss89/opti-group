const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const http = require('http');

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

// ====== LID to Phone Mapping ======
const lidMap = {}; // lid_number -> phone_number
function loadLidMappings() {
  const authPath = path.join(__dirname, 'auth_info');
  try {
    const files = fs.readdirSync(authPath).filter(f => f.startsWith('lid-mapping-') && f.endsWith('_reverse.json'));
    for (const f of files) {
      try {
        const lid = f.replace('lid-mapping-', '').replace('_reverse.json', '');
        const phone = JSON.parse(fs.readFileSync(path.join(authPath, f), 'utf-8'));
        if (phone && typeof phone === 'string') lidMap[lid] = phone;
      } catch {}
    }
    log('📋 Loaded ' + Object.keys(lidMap).length + ' LID mappings');
  } catch (e) { log('⚠️ Could not load LID mappings: ' + e.message); }
}

function resolveLidToPhone(lid) {
  // lid format: 278597432508583@lid -> extract number
  const lidNum = lid.replace('@lid', '');
  if (lidMap[lidNum]) return lidMap[lidNum];
  // Try loading on the fly
  try {
    const f = path.join(__dirname, 'auth_info', `lid-mapping-${lidNum}_reverse.json`);
    if (fs.existsSync(f)) {
      const phone = JSON.parse(fs.readFileSync(f, 'utf-8'));
      if (phone && typeof phone === 'string') { lidMap[lidNum] = phone; return phone; }
    }
  } catch {}
  return null;
}

// ====== ANTI-BAN: Rate Limiting ======
const messageTimestamps = {};
const MAX_MESSAGES_PER_USER_PER_HOUR = 15;
const MAX_TOTAL_MESSAGES_PER_HOUR = 40;
let totalMessagesSent = [];
const MESSAGE_COOLDOWN_MS = 2000;
const TYPING_DELAY_MS = 1500;

function isRateLimited(phone) {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  totalMessagesSent = totalMessagesSent.filter(t => t > oneHourAgo);
  if (totalMessagesSent.length >= MAX_TOTAL_MESSAGES_PER_HOUR) return true;
  if (!messageTimestamps[phone]) messageTimestamps[phone] = [];
  messageTimestamps[phone] = messageTimestamps[phone].filter(t => t > oneHourAgo);
  if (messageTimestamps[phone].length >= MAX_MESSAGES_PER_USER_PER_HOUR) return true;
  return false;
}

function recordMessageSent(phone) {
  const now = Date.now();
  totalMessagesSent.push(now);
  if (!messageTimestamps[phone]) messageTimestamps[phone] = [];
  messageTimestamps[phone].push(now);
}

const lastResponseTime = {};
const MIN_RESPONSE_INTERVAL_MS = 3000;

function canRespondToUser(phone) {
  const now = Date.now();
  if (lastResponseTime[phone] && (now - lastResponseTime[phone]) < MIN_RESPONSE_INTERVAL_MS) return false;
  return true;
}

function recordResponse(phone) { lastResponseTime[phone] = Date.now(); }

// ====== Logging ======
function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  console.log(line.trimEnd());
  try { fs.appendFileSync(LOG_FILE, line); } catch {}
}

// ====== File helpers ======
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
    log('DB error: ' + e.message);
    const c = loadCodes(); c[code] = { phone, createdAt: new Date().toISOString(), activated: false }; saveCodes(c);
  }
}

// ====== Message Templates ======
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

بعد الدفع أرسل صورة تأكيد الدفع هنا ✅

📸 تأكد أن الصورة توضح:
- الرقم المحول ليه (01028900122)
- المبلغ (50 جنيه)
- تاريخ ووقت التحويل`;

// ====== Presence ======
async function setOnline() {
  if (!sock || !botConnected) return;
  try { await sock.sendPresenceUpdate('available'); } catch {}
}

function startPresenceKeepAlive() {
  if (presenceInterval) clearInterval(presenceInterval);
  setTimeout(setOnline, 10000);
  presenceInterval = setInterval(setOnline, 120000);
}

function stopPresenceKeepAlive() {
  if (presenceInterval) { clearInterval(presenceInterval); presenceInterval = null; }
}

// ====== Safe Send ======
async function safeSend(jid, content) {
  if (!sock || !botConnected) return false;
  const phone = jid.replace('@s.whatsapp.net', '');
  if (isRateLimited(phone)) { log('🚫 Rate limited: ' + phone); return false; }
  try {
    await sock.sendMessage(jid, content);
    recordMessageSent(phone);
    log('✅ Sent to ' + phone);
    return true;
  } catch (e) { log('❌ Send failed: ' + e.message); return false; }
}

// ====== HTTP API ======
http.createServer(async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  if (req.url === '/status') { res.end(JSON.stringify({ connected: botConnected, uptime: process.uptime(), messagesSent: totalMessagesSent.length })); return; }
  if (req.url === '/log') { try { res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end((fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '').slice(-3000)); } catch { res.end('No logs'); } return; }
  res.end(JSON.stringify({ status: 'ok', connected: botConnected }));
}).listen(8787, '0.0.0.0', () => { log('🌐 API on :8787'); startWA(); });

// ====== WhatsApp Connection ======
async function startWA() {
  log('🚀 Starting WhatsApp...');
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
      keepAliveIntervalMs: 30000,
      generateHighQualityLinkPreview: false,
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // ====== CONNECTION UPDATES ======
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        botConnected = false;
        try {
          const QRCode = require('qrcode');
          await QRCode.toFile(path.join(__dirname, '..', 'public', 'whatsapp-qr.png'), qr, { width: 400, margin: 2 });
          writePairingStatus({ status: 'ready', qrAvailable: true });
        } catch { writePairingStatus({ status: 'ready' }); }
      }
      
      if (connection === 'close') {
        botConnected = false;
        stopPresenceKeepAlive();
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        log('🔴 Closed. Status: ' + statusCode);
        if (statusCode !== DisconnectReason.loggedOut && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          setTimeout(startWA, Math.min(5000 * reconnectAttempts, 60000));
        } else if (statusCode === DisconnectReason.loggedOut) {
          writePairingStatus({ status: 'logged_out' });
          reconnectAttempts = 0;
        }
      }
      
      if (connection === 'open') {
        botConnected = true;
        reconnectAttempts = 0;
        log('✅ CONNECTED!');
        writePairingStatus({ status: 'connected' });
        startPresenceKeepAlive();
      }
    });
    
    // ====== MESSAGE HANDLER ======
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        const m = messages[0];
        if (!m) return;
        
        const from = m.key.remoteJid;
        const hasMessage = !!m.message;
        const msgTypes = m.message ? Object.keys(m.message).join(',') : 'NONE';
        
        // LOG EVERYTHING for debugging
        log(`📨 type=${type} from=${from} fromMe=${m.key.fromMe} hasMsg=${hasMessage} types=${msgTypes}`);
        
        // Skip own messages
        if (m.key.fromMe) return;
        
        // Accept both 'notify' and 'append' - these are new incoming messages
        // 'notify' = new chat notification, 'append' = new message in existing chat
        if (type !== 'notify' && type !== 'append') return;
        
        // Must have message content
        if (!m.message) return;
        
        // Only DMs (not groups or newsletters)
        if (from.endsWith('@g.us') || from.endsWith('@newsletter')) return;
        
        // Accept both @s.whatsapp.net (phone number) and @lid (linked ID - newer WhatsApp)
        let phone = '';
        let respondTo = from; // JID to send response to
        if (from.endsWith('@s.whatsapp.net')) {
          phone = from.replace('@s.whatsapp.net', '');
        } else if (from.endsWith('@lid')) {
          // LID format - resolve to phone number using mapping
          const resolvedPhone = resolveLidToPhone(from);
          if (resolvedPhone) {
            phone = resolvedPhone;
            // We need to send response to the @s.whatsapp.net JID, not @lid
            respondTo = resolvedPhone + '@s.whatsapp.net';
            log(`🔗 LID ${from} → phone ${resolvedPhone}`);
          } else {
            phone = from; // Use LID as identifier
            log(`⚠️ Unknown LID: ${from} - no phone mapping found`);
          }
        } else {
          return; // Unknown type, skip
        }
        
        // Check cooldown
        if (!canRespondToUser(phone)) {
          log('⏳ Cooldown: ' + phone);
          return;
        }
        
        // Get text
        const text = m.message?.conversation 
          || m.message?.extendedTextMessage?.text 
          || m.message?.imageMessage?.caption 
          || '';
        
        log(`📩 DM from ${phone}: ${text || '[IMAGE]'}`);
        
        // Mark read
        await new Promise(r => setTimeout(r, 800));
        try { await sock.readMessages([m.key]); } catch {}
        
        // Typing
        try { await sock.sendPresenceUpdate('composing', respondTo); } catch {}
        await new Promise(r => setTimeout(r, Math.min(Math.max(TYPING_DELAY_MS, text.length * 40), 2500)));
        
        recordResponse(phone);
        
        // Owner chat mode
        if (ownerChatActive[phone]) {
          if (text.trim() === 'انتهى' || text.trim() === 'انهى') {
            ownerChatActive[phone] = false;
            await safeSend(respondTo, { text: 'شكراً! 🙏' });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }
        
        // Image (payment receipt)
        if (m.message?.imageMessage) {
          if (userStates[phone] === 'awaiting_receipt') {
            await handleReceipt(respondTo, phone, m);
          } else {
            await safeSend(respondTo, { text: WELCOME });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }
        
        // Text commands
        const cmd = text.trim();
        if (cmd === '1' || cmd === 'اشتراك' || cmd === 'اشترك') {
          userStates[phone] = 'awaiting_receipt';
          await safeSend(respondTo, { text: SUB_INFO });
        } else if (cmd === '2' || cmd === 'تحدث') {
          ownerChatActive[phone] = true;
          await safeSend(respondTo, { text: '👤 تم تحويلك لفريق الدعم.\nلإنهاء المحادثة أرسل: انتهى' });
        } else {
          await safeSend(respondTo, { text: WELCOME });
        }
        
        try { await sock.sendPresenceUpdate('available'); } catch {}
      } catch (err) {
        log('❌ Handler error: ' + err.message);
      }
    });
    
  } catch (err) {
    log('❌ startWA error: ' + err.message);
    botConnected = false;
    if (reconnectAttempts < MAX_RECONNECT) {
      reconnectAttempts++;
      setTimeout(startWA, Math.min(5000 * reconnectAttempts, 60000));
    }
  }
}

// ====== Receipt Handler ======
async function handleReceipt(from, phone, msg) {
  await safeSend(from, { text: '⏳ جاري المراجعة...' });
  await new Promise(r => setTimeout(r, 2000));
  try {
    const buf = await sock.downloadMediaMessage(msg);
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      const b64 = buf.toString('base64');
      const r = await zai.chat.completions.create({
        messages: [{ role: 'user', content: [
          { type: 'text', text: `تحقق من إيصال الدفع:\n1. الرقم 01028900122؟\n2. المبلغ 50 جنيه؟\n3. تاريخ/وقت؟\n4. تم الدفع؟\n5. النتيجة: مقبول/مرفوض\nبالعربية باختصار.` },
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
      log('AI failed: ' + aiErr.message);
      const code = generateCode(phone);
      await saveSubscriptionToDB(code, phone);
      userStates[phone] = 'idle';
      await safeSend(from, { text: `✅ تم استلام الدفع!\n\n🔑 الكود: ${code}\n\nأدخله في OptiSize\nشكراً! 🙏` });
    }
  } catch (e) {
    log('Receipt error: ' + e.message);
    await safeSend(from, { text: '⚠️ خطأ. حاول تاني.' });
  }
}

// ====== Process handlers ======
process.on('uncaughtException', (err) => { log('💥 Uncaught: ' + err.message); });
process.on('unhandledRejection', (r) => { log('💥 Rejection: ' + r); });
process.on('SIGINT', () => { stopPresenceKeepAlive(); process.exit(0); });
process.on('SIGTERM', () => { stopPresenceKeepAlive(); process.exit(0); });

log('🚀 OptiSize Bot starting...');
log('Node: ' + process.version + ' PID: ' + process.pid);
loadLidMappings();
