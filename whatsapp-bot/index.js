// ====== OptiSize WhatsApp Bot - Fixed Version ======
// Fixes: downloadMediaMessage, LID handling, dedup, PID lock, robust reconnect

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,   // ← STANDALONE in Baileys v7, NOT sock.downloadMediaMessage
  getContentType,
  isLidUser,
  isJidGroup,
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

// ====== Paths ======
const CODES_FILE = path.join(__dirname, 'subscription_codes.json');
const PAIRING_FILE = path.join(__dirname, '..', 'public', 'pairing.json');
const LOG_FILE = path.join(__dirname, 'bot.log');
const PID_FILE = path.join(__dirname, 'bot.pid');
const AUTH_PATH = path.join(__dirname, 'auth_info');

// ====== State ======
let userStates = {};
let ownerChatActive = {};
let botConnected = false;
let sock = null;
let presenceInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 10;

// ====== LID to Phone Mapping ======
const lidMap = {};
function loadLidMappings() {
  try {
    const files = fs.readdirSync(AUTH_PATH).filter(f => f.startsWith('lid-mapping-') && f.endsWith('_reverse.json'));
    for (const f of files) {
      try {
        const lid = f.replace('lid-mapping-', '').replace('_reverse.json', '');
        const phone = JSON.parse(fs.readFileSync(path.join(AUTH_PATH, f), 'utf-8'));
        if (phone && typeof phone === 'string') lidMap[lid] = phone;
      } catch {}
    }
    log('📋 Loaded ' + Object.keys(lidMap).length + ' LID mappings');
  } catch (e) { log('⚠️ LID mappings: ' + e.message); }
}

function resolveLidToPhone(lid) {
  const lidNum = lid.replace('@lid', '');
  if (lidMap[lidNum]) return lidMap[lidNum];
  try {
    const f = path.join(AUTH_PATH, `lid-mapping-${lidNum}_reverse.json`);
    if (fs.existsSync(f)) {
      const phone = JSON.parse(fs.readFileSync(f, 'utf-8'));
      if (phone && typeof phone === 'string') { lidMap[lidNum] = phone; return phone; }
    }
  } catch {}
  return null;
}

// ====== Message Deduplication ======
const processedMsgIds = new Set();
const MAX_DEDUP_SIZE = 500;

function isDuplicate(msgId) {
  if (processedMsgIds.has(msgId)) return true;
  processedMsgIds.add(msgId);
  if (processedMsgIds.size > MAX_DEDUP_SIZE) {
    const arr = [...processedMsgIds];
    arr.splice(0, 200).forEach(id => processedMsgIds.delete(id));
  }
  return false;
}

// ====== Anti-Ban: Rate Limiting ======
const messageTimestamps = {};
const MAX_PER_USER_HOUR = 15;
const MAX_TOTAL_HOUR = 40;
let totalMessagesSent = [];
const MIN_BETWEEN_MS = 2000;
const TYPING_DELAY_MS = 1500;
const MIN_RESPONSE_MS = 3000;
const lastResponseTime = {};

function isRateLimited(phone) {
  const now = Date.now();
  const ago = now - 3600000;
  totalMessagesSent = totalMessagesSent.filter(t => t > ago);
  if (totalMessagesSent.length >= MAX_TOTAL_HOUR) return true;
  if (!messageTimestamps[phone]) messageTimestamps[phone] = [];
  messageTimestamps[phone] = messageTimestamps[phone].filter(t => t > ago);
  if (messageTimestamps[phone].length >= MAX_PER_USER_HOUR) return true;
  return false;
}

function recordMsgSent(phone) {
  const now = Date.now();
  totalMessagesSent.push(now);
  if (!messageTimestamps[phone]) messageTimestamps[phone] = [];
  messageTimestamps[phone].push(now);
}

function canRespond(phone) {
  const now = Date.now();
  if (lastResponseTime[phone] && (now - lastResponseTime[phone]) < MIN_RESPONSE_MS) return false;
  return true;
}

function recordResponse(phone) { lastResponseTime[phone] = Date.now(); }

// ====== PID Lock (prevent duplicate processes) ======
function checkAndWritePID() {
  try {
    if (fs.existsSync(PID_FILE)) {
      const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim());
      if (oldPid && !isNaN(oldPid)) {
        // Skip check if the PID is our own process
        if (oldPid === process.pid) {
          log('📋 PID file has our own PID, continuing...');
        } else {
          try {
            process.kill(oldPid, 0); // Check if process is alive
            // If we get here, old process is still running
            console.log(`❌ Another bot instance is already running (PID ${oldPid}). Exiting.`);
            process.exit(1);
          } catch {
            // Old process is dead, safe to take over
            log(`🔄 Stale PID ${oldPid} found, taking over...`);
          }
        }
      }
    }
    fs.writeFileSync(PID_FILE, String(process.pid));
  } catch (e) { log('⚠️ PID check: ' + e.message); }
}

// ====== Logging ======
function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  // Only write to console OR file, not both (to avoid duplicates when stdout is piped to log file)
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch { console.log(line); }
}

// ====== File Helpers ======
function writePairingStatus(data) {
  try { fs.writeFileSync(PAIRING_FILE, JSON.stringify(data)); } catch {}
}

function loadCodes() {
  try { if (fs.existsSync(CODES_FILE)) return JSON.parse(fs.readFileSync(CODES_FILE, 'utf-8')); } catch {}
  return {};
}

function saveCodes(codes) {
  try { fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2)); } catch {}
}

function generateCode(phone) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const last4 = phone.replace(/\D/g, '').slice(-4);
  let code;
  const codes = loadCodes();
  do {
    code = `${letters[Math.floor(Math.random()*26)]}${letters[Math.floor(Math.random()*26)]}${letters[Math.floor(Math.random()*26)]}${last4}${Math.floor(Math.random()*10)}`;
  } while (codes[code]);
  return code;
}

async function saveSubscriptionToDB(code, phone) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try { await prisma.subscription.create({ data: { code, phone, isActive: false } }); }
    catch (e) {
      const c = loadCodes();
      c[code] = { phone, createdAt: new Date().toISOString(), activated: false };
      saveCodes(c);
    }
    finally { await prisma.$disconnect(); }
  } catch (e) {
    log('DB fallback: ' + e.message);
    const c = loadCodes();
    c[code] = { phone, createdAt: new Date().toISOString(), activated: false };
    saveCodes(c);
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
  if (!sock || !botConnected) { log('⚠️ Cannot send: not connected'); return false; }
  const phone = jid.replace('@s.whatsapp.net', '').replace('@lid', '');
  if (isRateLimited(phone)) { log('🚫 Rate limited: ' + phone); return false; }
  try {
    await sock.sendMessage(jid, content);
    recordMsgSent(phone);
    log('✅ Sent to ' + phone);
    return true;
  } catch (e) {
    log('❌ Send error: ' + e.message);
    return false;
  }
}

// ====== HTTP API ======
http.createServer(async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  if (req.url === '/status') {
    res.end(JSON.stringify({ connected: botConnected, uptime: process.uptime(), pid: process.pid, sent: totalMessagesSent.length }));
    return;
  }
  if (req.url === '/log') {
    try {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end((fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '').slice(-5000));
    } catch { res.end('No logs'); }
    return;
  }
  res.end(JSON.stringify({ status: 'ok', connected: botConnected, pid: process.pid }));
}).listen(8787, '0.0.0.0', () => {
  log('🌐 API on :8787');
  startWA();
});

// ====== WhatsApp Connection ======
async function startWA() {
  log('🚀 Starting WhatsApp connection...');
  try {
    const { version } = await fetchLatestBaileysVersion();
    log('📦 Baileys version: ' + version.join('.'));
    
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);
    
    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ['OptiSize Bot', 'Chrome', '1.0'],
      markOnlineOnConnect: true,
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 30000,
      generateHighQualityLinkPreview: false,
      // Important: don't emit own events to avoid duplicate processing
      emitOwnEvents: false,
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
          log('📱 QR code saved');
        } catch { writePairingStatus({ status: 'ready' }); }
      }
      
      if (connection === 'close') {
        botConnected = false;
        stopPresenceKeepAlive();
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        log('🔴 Connection closed. Status: ' + statusCode);
        
        if (statusCode !== DisconnectReason.loggedOut && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          const delay = Math.min(5000 * reconnectAttempts, 60000);
          log(`🔄 Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT})...`);
          setTimeout(startWA, delay);
        } else if (statusCode === DisconnectReason.loggedOut) {
          writePairingStatus({ status: 'logged_out' });
          log('🚫 Logged out. Need to re-pair.');
          reconnectAttempts = 0;
        }
      }
      
      if (connection === 'open') {
        botConnected = true;
        reconnectAttempts = 0;
        log('✅ WHATSAPP CONNECTED!');
        writePairingStatus({ status: 'connected' });
        startPresenceKeepAlive();
      }
    });
    
    // ====== MESSAGE HANDLER ======
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        const m = messages[0];
        if (!m) return;
        
        // Skip if no message content
        if (!m.message) return;
        
        // Skip own messages
        if (m.key.fromMe) return;
        
        const from = m.key.remoteJid;
        const msgId = m.key.id;
        
        // Deduplicate
        if (isDuplicate(msgId)) {
          log('⏭️ Duplicate: ' + msgId);
          return;
        }
        
        const msgTypes = Object.keys(m.message).join(',');
        log(`📨 [${type}] from=${from} types=${msgTypes}`);
        
        // Only handle new messages (notify = new chat, append = new msg in existing chat)
        if (type !== 'notify' && type !== 'append') return;
        
        // Skip groups and newsletters
        if (from.endsWith('@g.us') || from.endsWith('@newsletter')) return;
        
        // ====== Resolve JID to phone number ======
        let phone = '';
        let respondTo = from;
        
        if (from.endsWith('@s.whatsapp.net')) {
          phone = from.replace('@s.whatsapp.net', '');
        } else if (from.endsWith('@lid')) {
          // WhatsApp LID format - resolve to phone number
          const resolvedPhone = resolveLidToPhone(from);
          if (resolvedPhone) {
            phone = resolvedPhone;
            respondTo = resolvedPhone + '@s.whatsapp.net';
            log(`🔗 LID ${from} → ${resolvedPhone}`);
          } else {
            // Can't resolve LID - try sending to LID directly (may work)
            phone = from.replace('@lid', '');
            respondTo = from;
            log(`⚠️ Unresolved LID: ${from}, will try responding to LID`);
          }
        } else {
          log('⏭️ Unknown JID type: ' + from);
          return;
        }
        
        // Check cooldown
        if (!canRespond(phone)) {
          log('⏳ Cooldown: ' + phone);
          return;
        }
        
        // Get text content
        const text = m.message?.conversation 
          || m.message?.extendedTextMessage?.text 
          || m.message?.imageMessage?.caption 
          || '';
        
        log(`📩 DM from ${phone}: ${text || '[IMAGE]'}`);
        
        // Mark as read (with small natural delay)
        await new Promise(r => setTimeout(r, 800));
        try { await sock.readMessages([m.key]); } catch {}
        
        // Show typing indicator
        try { await sock.sendPresenceUpdate('composing', respondTo); } catch {}
        await new Promise(r => setTimeout(r, Math.min(Math.max(TYPING_DELAY_MS, text.length * 30), 2500)));
        
        recordResponse(phone);
        
        // ====== Owner chat mode ======
        if (ownerChatActive[phone]) {
          if (text.trim() === 'انتهى' || text.trim() === 'انهى') {
            ownerChatActive[phone] = false;
            await safeSend(respondTo, { text: 'شكراً! 🙏' });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }
        
        // ====== Image (payment receipt) ======
        if (m.message?.imageMessage) {
          if (userStates[phone] === 'awaiting_receipt') {
            await handleReceipt(respondTo, phone, m);
          } else {
            await safeSend(respondTo, { text: WELCOME });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }
        
        // ====== Text commands ======
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
        log('❌ Handler error: ' + err.message + '\n' + (err.stack || ''));
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

// ====== Receipt Handler (FIXED: use standalone downloadMediaMessage) ======
async function handleReceipt(from, phone, msg) {
  await safeSend(from, { text: '⏳ جاري المراجعة...' });
  await new Promise(r => setTimeout(r, 2000));
  try {
    // ✅ FIXED: Use standalone downloadMediaMessage from baileys, NOT sock.downloadMediaMessage
    const buf = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      { logger: undefined, reuploadRequest: undefined }
    );
    
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
      log('⚠️ AI verify failed: ' + aiErr.message);
      const code = generateCode(phone);
      await saveSubscriptionToDB(code, phone);
      userStates[phone] = 'idle';
      await safeSend(from, { text: `✅ تم استلام الدفع!\n\n🔑 الكود: ${code}\n\nأدخله في OptiSize في مركز صحة العين\n⏰ صالح شهر\nشكراً! 🙏` });
    }
  } catch (e) {
    log('❌ Receipt error: ' + e.message);
    await safeSend(from, { text: '⚠️ خطأ في معالجة الصورة. حاول تاني.' });
  }
}

// ====== Process Handlers ======
process.on('uncaughtException', (err) => {
  log('💥 Uncaught: ' + err.message);
});

process.on('unhandledRejection', (reason) => {
  log('💥 Rejection: ' + (reason instanceof Error ? reason.message : String(reason)));
});

process.on('SIGINT', () => {
  log('🛑 SIGINT');
  stopPresenceKeepAlive();
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 SIGTERM');
  stopPresenceKeepAlive();
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('exit', () => {
  try { fs.unlinkSync(PID_FILE); } catch {}
});

// ====== STARTUP ======
log('🚀 OptiSize Bot starting...');
log('Node: ' + process.version + ' PID: ' + process.pid);

// Check PID lock before starting
checkAndWritePID();

// Clear old log (keep last 50KB)
try {
  if (fs.existsSync(LOG_FILE)) {
    const stat = fs.statSync(LOG_FILE);
    if (stat.size > 50000) {
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      fs.writeFileSync(LOG_FILE, content.slice(-20000));
    }
  }
} catch {}

// Load LID mappings
loadLidMappings();
