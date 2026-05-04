const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay: baileysDelay } = require('@whiskeysockets/baileys');
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

// ====== ANTI-BAN: Rate Limiting ======
const messageTimestamps = {}; // phone -> [timestamp, ...]
const MAX_MESSAGES_PER_USER_PER_HOUR = 10;
const MAX_TOTAL_MESSAGES_PER_HOUR = 30;
let totalMessagesSent = []; // timestamps of all sent messages
const MESSAGE_COOLDOWN_MS = 3000; // minimum 3s between messages to same user
const TYPING_DELAY_MS = 1500; // minimum typing delay before responding
const SUB_MESSAGES_DELAY_MS = 3000; // delay between subscription flow messages

function isRateLimited(phone) {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  
  // Clean old entries
  totalMessagesSent = totalMessagesSent.filter(t => t > oneHourAgo);
  
  // Check total messages per hour
  if (totalMessagesSent.length >= MAX_TOTAL_MESSAGES_PER_HOUR) {
    log('⚠️ RATE LIMIT: Total hourly limit reached (' + totalMessagesSent.length + ')');
    return true;
  }
  
  // Check per-user limit
  if (!messageTimestamps[phone]) messageTimestamps[phone] = [];
  messageTimestamps[phone] = messageTimestamps[phone].filter(t => t > oneHourAgo);
  
  if (messageTimestamps[phone].length >= MAX_MESSAGES_PER_USER_PER_HOUR) {
    log('⚠️ RATE LIMIT: Per-user hourly limit reached for ' + phone);
    return true;
  }
  
  // Check cooldown between messages to same user
  const lastMsg = messageTimestamps[phone].length > 0 ? messageTimestamps[phone][messageTimestamps[phone].length - 1] : 0;
  if (now - lastMsg < MESSAGE_COOLDOWN_MS) {
    log('⚠️ RATE LIMIT: Cooldown not expired for ' + phone);
    return true;
  }
  
  return false;
}

function recordMessageSent(phone) {
  const now = Date.now();
  totalMessagesSent.push(now);
  if (!messageTimestamps[phone]) messageTimestamps[phone] = [];
  messageTimestamps[phone].push(now);
}

// ====== ANTI-BAN: Cooldown per user (don't respond too fast) ======
const lastResponseTime = {}; // phone -> timestamp
const MIN_RESPONSE_INTERVAL_MS = 5000; // minimum 5s between responses to same user

function canRespondToUser(phone) {
  const now = Date.now();
  if (lastResponseTime[phone] && (now - lastResponseTime[phone]) < MIN_RESPONSE_INTERVAL_MS) {
    log('⏳ Cooldown: ' + phone + ' - waiting ' + (MIN_RESPONSE_INTERVAL_MS - (now - lastResponseTime[phone])) + 'ms');
    return false;
  }
  return true;
}

function recordResponse(phone) {
  lastResponseTime[phone] = Date.now();
}

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

// ====== Code Generator ======
function generateCode(phone) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const last4 = phone.replace(/\D/g, '').slice(-4);
  let code; const codes = loadCodes();
  do { code = `${letters[Math.floor(Math.random()*26)]}${letters[Math.floor(Math.random()*26)]}${letters[Math.floor(Math.random()*26)]}${last4}${Math.floor(Math.random()*10)}`; } while (codes[code]);
  return code;
}

// ====== Subscription DB ======
async function saveSubscriptionToDB(code, phone) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try { await prisma.subscription.create({ data: { code, phone, isActive: false } }); }
    catch (e) { const c = loadCodes(); c[code] = { phone, createdAt: new Date().toISOString(), activated: false }; saveCodes(c); }
    finally { await prisma.$disconnect(); }
  } catch (e) {
    log('DB error, falling back to JSON: ' + e.message);
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

بعد الدفع أرسل صورة تأكيد الدفع هنا ✅`;

const PAY_CONFIRM = `📸 أرسل صورة تأكيد الدفع الآن

ملاحظة: تأكد أن الصورة توضح:
- الرقم المحول ليه (01028900122)
- المبلغ (50 جنيه)
- تاريخ ووقت التحويل`;

// ====== Presence / Online ======
async function setOnline() {
  if (!sock || !botConnected) return;
  try {
    await sock.sendPresenceUpdate('available');
  } catch {}
}

function startPresenceKeepAlive() {
  if (presenceInterval) clearInterval(presenceInterval);
  // Don't set online immediately - wait 10s after connect
  setTimeout(setOnline, 10000);
  presenceInterval = setInterval(setOnline, 120000); // every 2 minutes (less aggressive)
}

function stopPresenceKeepAlive() {
  if (presenceInterval) { clearInterval(presenceInterval); presenceInterval = null; }
}

// ====== Safe Send with Rate Limiting ======
async function safeSend(jid, content) {
  if (!sock || !botConnected) return false;
  
  const phone = jid.replace('@s.whatsapp.net', '');
  
  // Check rate limits
  if (isRateLimited(phone)) {
    log('🚫 Message blocked by rate limit for ' + phone);
    return false;
  }
  
  try {
    await sock.sendMessage(jid, content);
    recordMessageSent(phone);
    log('✅ Message sent to ' + phone);
    return true;
  } catch (e) {
    log('❌ Send failed: ' + e.message);
    return false;
  }
}

// ====== HTTP API ======
const apiServer = http.createServer(async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  
  if (req.url === '/status') {
    res.end(JSON.stringify({ 
      connected: botConnected, 
      uptime: process.uptime(),
      messagesSent: totalMessagesSent.length,
    }));
    return;
  }
  
  if (req.url === '/request-code') {
    if (botConnected) {
      writePairingStatus({ status: 'connected' });
      res.end(JSON.stringify({ status: 'connected' }));
      return;
    }
    if (!sock) {
      res.end(JSON.stringify({ status: 'error', message: 'لا يوجد اتصال' }));
      return;
    }
    try {
      const code = await Promise.race([
        sock.requestPairingCode('201028900122'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000))
      ]);
      const fmt = code?.match(/.{1,4}/g)?.join('-') || code;
      log('🔑 Pairing code: ' + fmt);
      const result = { status: 'pairing', code: fmt, rawCode: code, phone: '201028900122' };
      writePairingStatus(result);
      res.end(JSON.stringify(result));
    } catch (e) {
      log('❌ Code error: ' + e.message);
      res.end(JSON.stringify({ status: 'error', message: e.message }));
    }
    return;
  }
  
  if (req.url === '/log') {
    try {
      const logContent = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : 'No logs yet';
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(logContent.slice(-3000));
    } catch { res.end('Error reading log'); }
    return;
  }
  
  res.end(JSON.stringify({ status: 'ok', connected: botConnected }));
});

apiServer.listen(8787, '0.0.0.0', () => {
  log('🌐 API server on :8787');
  startWA();
});

// ====== WhatsApp Connection ======
async function startWA() {
  log('🚀 Starting WhatsApp connection...');
  
  try {
    const { version } = await fetchLatestBaileysVersion();
    log('📱 Baileys version: ' + version.join('.'));
    
    const authPath = path.join(__dirname, 'auth_info');
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    
    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ['OptiSize Bot', 'Chrome', '1.0'],
      markOnlineOnConnect: true,
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 30000, // less aggressive keepalive
      emitOwnEvents: false,
      // Reduce message processing to avoid spam detection
      syncFullHistory: false,
      fireInitQueries: true,
      generateHighQualityLinkPreview: false,
    });
    
    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);
    
    // Connection updates
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        botConnected = false;
        try {
          const QRCode = require('qrcode');
          const qrPath = path.join(__dirname, '..', 'public', 'whatsapp-qr.png');
          await QRCode.toFile(qrPath, qr, { width: 400, margin: 2 });
          writePairingStatus({ status: 'ready', qrAvailable: true });
          log('📱 QR saved');
        } catch (e) {
          writePairingStatus({ status: 'ready' });
        }
      }
      
      if (connection === 'close') {
        botConnected = false;
        stopPresenceKeepAlive();
        
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        log('🔴 Connection closed. Status: ' + statusCode);
        
        if (shouldReconnect && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          const delay = Math.min(5000 * reconnectAttempts, 60000); // longer backoff
          log(`🔄 Reconnecting in ${delay}ms... (attempt ${reconnectAttempts})`);
          setTimeout(startWA, delay);
        } else if (statusCode === DisconnectReason.loggedOut) {
          writePairingStatus({ status: 'logged_out' });
          log('🔴 Logged out permanently.');
          reconnectAttempts = 0;
        }
      }
      
      if (connection === 'open') {
        botConnected = true;
        reconnectAttempts = 0;
        log('✅ WhatsApp CONNECTED!');
        writePairingStatus({ status: 'connected' });
        startPresenceKeepAlive();
      }
    });
    
    // Message handler
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        // Only process new messages
        if (type !== 'notify') return;
        
        const m = messages[0];
        if (!m || m.key.fromMe) return;
        
        const from = m.key.remoteJid;
        
        // Ignore groups completely
        if (from.endsWith('@g.us')) return;
        
        // Ignore newsletters
        if (from.endsWith('@newsletter')) return;
        
        // Only respond to DMs
        if (!from.endsWith('@s.whatsapp.net')) return;
        
        const phone = from.replace('@s.whatsapp.net', '');
        
        // Check user cooldown
        if (!canRespondToUser(phone)) return;
        
        // Extract text
        const text = m.message?.conversation 
          || m.message?.extendedTextMessage?.text 
          || m.message?.imageMessage?.caption 
          || '';
        
        log(`📩 DM from ${phone}: ${text || '[IMAGE]'}`);
        
        // Mark as read (with delay to look natural)
        await new Promise(r => setTimeout(r, 1000));
        try { await sock.readMessages([m.key]); } catch {}
        
        // Show typing indicator (looks natural)
        try { await sock.sendPresenceUpdate('composing', from); } catch {}
        
        // Natural typing delay (1.5-3 seconds based on message length)
        const typingDelay = Math.min(Math.max(TYPING_DELAY_MS, text.length * 50), 3000);
        await new Promise(r => setTimeout(r, typingDelay));
        
        // Record that we're responding
        recordResponse(phone);
        
        // Handle owner chat mode
        if (ownerChatActive[phone]) {
          if (text.trim() === 'انتهى' || text.trim() === 'انهى') {
            ownerChatActive[phone] = false;
            await safeSend(from, { text: 'شكراً! 🙏' });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }
        
        // Handle image messages (payment receipt)
        if (m.message?.imageMessage) {
          if (userStates[phone] === 'awaiting_receipt') {
            await handleReceipt(from, phone, m);
          } else {
            await safeSend(from, { text: WELCOME });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }
        
        // Handle text commands
        const cmd = text.trim();
        
        if (cmd === '1' || cmd === 'اشتراك' || cmd === 'اشترك') {
          userStates[phone] = 'awaiting_receipt';
          // Send combined message instead of 2 separate ones (less spammy)
          await safeSend(from, { text: SUB_INFO + '\n\n---\n\n' + PAY_CONFIRM });
        }
        else if (cmd === '2' || cmd === 'تحدث') {
          ownerChatActive[phone] = true;
          await safeSend(from, { text: '👤 تم تحويلك لفريق الدعم.\nلإنهاء المحادثة أرسل: انتهى' });
        }
        else {
          await safeSend(from, { text: WELCOME });
        }
        
        // Set back to available
        try { await sock.sendPresenceUpdate('available'); } catch {}
        
      } catch (err) {
        log('❌ Message handler error: ' + err.message);
      }
    });
    
  } catch (err) {
    log('❌ Fatal startWA error: ' + err.message);
    botConnected = false;
    
    if (reconnectAttempts < MAX_RECONNECT) {
      reconnectAttempts++;
      const delay = Math.min(5000 * reconnectAttempts, 60000);
      log(`🔄 Retrying in ${delay}ms...`);
      setTimeout(startWA, delay);
    }
  }
}

// ====== Receipt Handler ======
async function handleReceipt(from, phone, msg) {
  await safeSend(from, { text: '⏳ جاري المراجعة...' });
  
  // Wait before processing (anti-ban)
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    const buf = await sock.downloadMediaMessage(msg);
    
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      const b64 = buf.toString('base64');
      
      const r = await zai.chat.completions.create({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: `تحقق من إيصال الدفع:\n1. الرقم 01028900122؟ (نعم/لا)\n2. المبلغ 50 جنيه؟ (نعم/لا)\n3. تاريخ/وقت؟ (نعم/لا)\n4. تم الدفع؟ (نعم/لا)\n5. النتيجة: مقبول/مرفوض\nبالعربية باختصار.` },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } }
          ]
        }]
      });
      
      const a = r.choices[0]?.message?.content || '';
      log('🤖 AI: ' + a);
      
      if (a.includes('مقبول') && !a.includes('مرفوض')) {
        const code = generateCode(phone);
        await saveSubscriptionToDB(code, phone);
        userStates[phone] = 'idle';
        await safeSend(from, { text: `✅ تم التأكيد!\n\n🔑 الكود: ${code}\n\nأدخله في OptiSize في مركز صحة العين\n⏰ صالح شهر\nشكراً! 🙏` });
      } else {
        await safeSend(from, { text: '❌ غير مقبول. حاول تاني بصورة أوضح.' });
      }
    } catch (aiErr) {
      log('⚠️ AI failed: ' + aiErr.message);
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

// ====== Process error handlers ======
process.on('uncaughtException', (err) => {
  log('💥 Uncaught: ' + err.message);
});

process.on('unhandledRejection', (reason) => {
  log('💥 Rejection: ' + reason);
});

process.on('SIGINT', () => {
  log('👋 SIGINT');
  stopPresenceKeepAlive();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('👋 SIGTERM');
  stopPresenceKeepAlive();
  process.exit(0);
});

// ====== Start ======
log('🚀 OptiSize Bot starting (anti-ban mode)...');
log('Node: ' + process.version + ' PID: ' + process.pid);
