// ====== OptiSize WhatsApp Bot v3.0 - Mini Service ======
// Connected to OptiSize website API for subscription codes
// Runs on port 3003

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  getContentType,
  isLidUser,
  isJidGroup,
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');
const http = require('http');

// ====== Gemini AI Setup ======
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBe0dMWe6Ovw0E9Cu8Aa0IwKzKIyyg2ZbA';
let genAI = null;
let geminiModel = null;

const BOT_PORT = 3003;
const WEBSITE_URL = 'http://localhost:3000';
const BOT_API_SECRET = process.env.BOT_API_SECRET || 'optisize-bot-secret-2026';

function initGemini() {
  if (!GEMINI_API_KEY) {
    log('WARNING: GEMINI_API_KEY not set! Receipt verification will not work.');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    log('AI: Gemini API initialized successfully');
    return true;
  } catch (e) {
    log('AI: Gemini init failed: ' + e.message);
    return false;
  }
}

// ====== Paths ======
const AUTH_PATH = path.join(__dirname, 'auth_info');
const LOG_FILE = path.join(__dirname, 'bot.log');
const PID_FILE = path.join(__dirname, 'bot.pid');
const PAIRING_FILE = path.join(__dirname, '..', '..', 'public', 'pairing.json');
const CODES_FILE = path.join(__dirname, 'subscription_codes.json');

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
    log('Loaded ' + Object.keys(lidMap).length + ' LID mappings');
  } catch (e) { log('LID mappings: ' + e.message); }
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
const MIN_RESPONSE_MS = 3000;
const TYPING_DELAY_MS = 1500;
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

// ====== PID Lock ======
function checkAndWritePID() {
  try {
    if (fs.existsSync(PID_FILE)) {
      const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim());
      if (oldPid && !isNaN(oldPid)) {
        try {
          process.kill(oldPid, 0);
          console.log('Another bot instance is already running (PID ' + oldPid + '). Exiting.');
          process.exit(1);
        } catch {
          log('Stale PID ' + oldPid + ' found, taking over...');
        }
      }
    }
    fs.writeFileSync(PID_FILE, String(process.pid));
  } catch (e) { log('PID check: ' + e.message); }
}

// ====== Logging ======
function log(msg) {
  const ts = new Date().toISOString();
  const line = '[' + ts + '] ' + msg;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

// ====== File Helpers ======
function writePairingStatus(data) {
  try {
    const dir = path.dirname(PAIRING_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PAIRING_FILE, JSON.stringify(data));
  } catch (e) { log('Pairing status write error: ' + e.message); }
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
    code = '' + letters[Math.floor(Math.random()*26)] + letters[Math.floor(Math.random()*26)] + letters[Math.floor(Math.random()*26)] + last4 + Math.floor(Math.random()*10);
  } while (codes[code]);
  return code;
}

// ====== Save subscription to OptiSize Website API ======
async function saveSubscriptionToWebsite(code, phone) {
  try {
    const result = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        code: code,
        phone: phone,
        secret: BOT_API_SECRET,
      });

      const url = new URL('/api/subscriptions/create', WEBSITE_URL);

      const options = {
        hostname: url.hostname,
        port: url.port || 3000,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 10000,
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Parse error: ' + data.substring(0, 200)));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
      req.write(postData);
      req.end();
    });

    if (result.success) {
      log('Subscription code saved to website DB: ' + code);
      // Also save locally as backup
      const codes = loadCodes();
      codes[code] = { phone, createdAt: new Date().toISOString(), activated: false, syncedToWebsite: true };
      saveCodes(codes);
      return true;
    } else {
      log('Website API error: ' + (result.error || 'Unknown'));
      // Fallback to local
      const codes = loadCodes();
      codes[code] = { phone, createdAt: new Date().toISOString(), activated: false, syncedToWebsite: false };
      saveCodes(codes);
      return false;
    }
  } catch (e) {
    log('Website API failed, saving locally: ' + e.message);
    const codes = loadCodes();
    codes[code] = { phone, createdAt: new Date().toISOString(), activated: false, syncedToWebsite: false };
    saveCodes(codes);
    return false;
  }
}

// ====== Message Templates ======
const WELCOME = 'مرحباً بك في OptiSize! 👁️\n\nكيف يمكنني مساعدتك؟\n\n1️⃣ اشتراك - اشترك في مركز صحة العين VIP\n2️⃣ تحدث - تحدث مع فريق الدعم\n\nأرسل الرقم أو الكلمة 👇';

const SUB_INFO = '💎 اشتراك مركز صحة العين VIP\n\nقيمة الاشتراك: 50 جنيه شهرياً\n\n💰 طريقة الدفع:\nحول 50 جنيه على رقم:\n📱 01028900122\n\n(فودافون كاش / إنستاباي / أي طريقة تحويل)\n\nبعد الدفع أرسل صورة تأكيد الدفع هنا ✅\n\n📸 تأكد أن الصورة توضح:\n- الرقم المحول ليه (01028900122)\n- المبلغ (50 جنيه)\n- تاريخ ووقت التحويل';

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
  if (!sock || !botConnected) { log('Cannot send: not connected'); return false; }
  const phone = jid.replace('@s.whatsapp.net', '').replace('@lid', '');
  if (isRateLimited(phone)) { log('Rate limited: ' + phone); return false; }
  try {
    await sock.sendMessage(jid, content);
    recordMsgSent(phone);
    log('Sent to ' + phone);
    return true;
  } catch (e) {
    log('Send error: ' + e.message);
    return false;
  }
}

// ====== QR Code Storage ======
let currentQRCode = null;
let currentPairingCode = null;

// ====== HTTP API (Mini Service) ======
http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Status endpoint
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      connected: botConnected,
      uptime: process.uptime(),
      pid: process.pid,
      sent: totalMessagesSent.length,
      geminiReady: !!geminiModel,
      pairingCode: currentPairingCode,
      version: '3.0.0'
    }));
    return;
  }

  // Log endpoint
  if (req.url === '/log') {
    try {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end((fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '').slice(-5000));
    } catch { res.end('No logs'); }
    return;
  }

  // QR code page
  if (req.url === '/' || req.url === '/qr') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (botConnected) {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#0a0e1a;color:#eee"><div style="text-align:center"><h1 style="color:#00f0ff">✅ البوت متصل!</h1><p>البوت شغال ومتصل بواتساب</p><p style="color:#64748b;font-size:12px">OptiSize Bot v3.0 - Mini Service</p></div></body></html>');
    } else if (currentQRCode) {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#0a0e1a;color:#eee"><div style="text-align:center"><h2 style="color:#00f0ff">📱 امسح كود QR بواتساب</h2><p>واتساب > الإعدادات > الأجهزة المرتبطة > ربط جهاز</p><img src="' + currentQRCode + '" style="border:10px solid white;border-radius:10px;margin:20px"/><p style="color:#aaa">الكود بيتجدد كل 20 ثانية</p>' + (currentPairingCode ? '<p style="margin-top:20px">أو استخدم كود الربط: <b style="font-size:24px;color:#00f0ff">' + currentPairingCode + '</b></p><p style="color:#aaa">واتساب > الإعدادات > الأجهزة المرتبطة > ربط برقم الهاتف</p>' : '') + '</div></body></html>');
    } else {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#0a0e1a;color:#eee"><div style="text-align:center"><h2 style="color:#00f0ff">⏳ جاري انتظار كود QR...</h2><p>البوت بيشتغل. اعمل ريفريش بعد شوية.</p></div></body></html>');
    }
    return;
  }

  // Default
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'optisize-whatsapp-bot', connected: botConnected, version: '3.0.0' }));
}).listen(BOT_PORT, '0.0.0.0', () => {
  log('🌐 Mini Service API on port ' + BOT_PORT);
  initGemini();
  startWA();
});

// ====== WhatsApp Connection ======
async function startWA() {
  log('Starting WhatsApp connection...');
  try {
    const { version } = await fetchLatestBaileysVersion();
    log('Baileys version: ' + version.join('.'));

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      browser: ['OptiSize Bot', 'Chrome', '3.0'],
      markOnlineOnConnect: true,
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 30000,
      generateHighQualityLinkPreview: false,
      emitOwnEvents: false,
    });

    sock.ev.on('creds.update', saveCreds);

    // ====== CONNECTION UPDATES ======
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        botConnected = false;
        currentQRCode = null;
        currentPairingCode = null;

        try {
          const QRCode = require('qrcode');
          currentQRCode = await QRCode.toDataURL(qr, { width: 400, margin: 2 });
          log('QR code generated for web display');
        } catch (e) { log('QR toDataURL error: ' + e.message); }

        try {
          const OWNER_PHONE = process.env.OWNER_PHONE || '201028900122';
          const pairingCode = await sock.requestPairingCode(OWNER_PHONE);
          currentPairingCode = pairingCode;
          console.log('\n========================================');
          console.log('PAIRING CODE: ' + pairingCode);
          console.log('========================================');
          log('Pairing code: ' + pairingCode);
        } catch (e) {
          log('Pairing code error: ' + e.message);
        }

        writePairingStatus({ status: 'ready' });
      }

      if (connection === 'close') {
        botConnected = false;
        stopPresenceKeepAlive();
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        log('Connection closed. Status: ' + statusCode);

        if (statusCode !== DisconnectReason.loggedOut && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          const delay = Math.min(5000 * reconnectAttempts, 60000);
          log('Reconnecting in ' + (delay/1000) + 's (attempt ' + reconnectAttempts + '/' + MAX_RECONNECT + ')...');
          setTimeout(startWA, delay);
        } else if (statusCode === DisconnectReason.loggedOut) {
          writePairingStatus({ status: 'logged_out' });
          log('Logged out. Need to re-pair.');
          reconnectAttempts = 0;
        }
      }

      if (connection === 'open') {
        botConnected = true;
        currentQRCode = null;
        currentPairingCode = null;
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
        if (!m.message) return;
        if (m.key.fromMe) return;

        const from = m.key.remoteJid;
        const msgId = m.key.id;

        if (isDuplicate(msgId)) {
          log('Duplicate: ' + msgId);
          return;
        }

        const msgTypes = Object.keys(m.message).join(',');
        log('[' + type + '] from=' + from + ' types=' + msgTypes);

        if (type !== 'notify' && type !== 'append') return;
        if (from.endsWith('@g.us') || from.endsWith('@newsletter')) return;

        let phone = '';
        let respondTo = from;

        if (from.endsWith('@s.whatsapp.net')) {
          phone = from.replace('@s.whatsapp.net', '');
        } else if (from.endsWith('@lid')) {
          const resolvedPhone = resolveLidToPhone(from);
          if (resolvedPhone) {
            phone = resolvedPhone;
            respondTo = resolvedPhone + '@s.whatsapp.net';
            log('LID ' + from + ' -> ' + resolvedPhone);
          } else {
            phone = from.replace('@lid', '');
            respondTo = from;
            log('Unresolved LID: ' + from + ', will try responding to LID');
          }
        } else {
          log('Unknown JID type: ' + from);
          return;
        }

        if (!canRespond(phone)) {
          log('Cooldown: ' + phone);
          return;
        }

        const text = m.message?.conversation
          || m.message?.extendedTextMessage?.text
          || m.message?.imageMessage?.caption
          || '';

        log('DM from ' + phone + ': ' + (text || '[IMAGE]'));

        await new Promise(r => setTimeout(r, 800));
        try { await sock.readMessages([m.key]); } catch {}

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
        log('Handler error: ' + err.message + '\n' + (err.stack || ''));
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

// ====== Receipt Handler (Gemini AI) ======

const RECEIPT_VERIFY_PROMPT = `أنت نظام تحقق صارم من إيصالات الدفع والتحويل.

الخطوة 1: أولاً تأكد إن الصورة دي فعلاً إيصال دفع أو تحويل
- لازم تشوف كلمات تدل على الدفع أو التحويل زي: "تم التحويل" أو "مرسل" أو "تم الإرسال" أو "تحويل ناجح" أو "تم الدفع" أو "دفع ناجح" أو "Sent" أو "Transferred" أو "Payment" أو "Paid"
- لو مفيش كلمات تدل على إن فيه دفع أو تحويل حصل -> مش إيصال دفع -> مرفوض

الخطوة 2: استخرج البيانات من الإيصال
1. الرقم المحول ليه أو رقم المستقبل
2. المبلغ المحول بالظبط
3. تاريخ التحويل (يوم/شهر/سنة)
4. وقت التحويل (ساعة:دقيقة)
5. طريقة الدفع (فودافون كاش / إنستاباي / تحويل بنكي / غيرها)

الخطوة 3: تحقق من البيانات
- الرقم لازم يكون 01028900122 بالظبط
- المبلغ لازم يكون 50 جنيه بالظبط - لو أي مبلغ تاني -> مرفوض
- التاريخ لازم يكون تاريخ اليوم أو أمس فقط - لو التاريخ أقدم من كده -> مرفوض
- الوقت لازم يكون موجود وواضح
- طريقة الدفع ممكن تكون أي طريقة (فودافون كاش، إنستاباي، تحويل بنكي، إلخ)

تحذيرات مهمة:
- لو المبلغ مش 50 جنيه بالظبط -> مرفوض
- لو التاريخ أقدم من أمس -> مرفوض
- لو مفيش كلمة تدل على الدفع أو التحويل -> مرفوض
- لو الصورة مش إيصال دفع -> مرفوض
- طريقة الدفع مش شرط تكون فودافون كاش - أي طريقة مقبولة

أجب بالتنسيق ده بالظبط (مهم جداً تلتزم بالتنسيق):
TYPE: [إيصال دفع / مش إيصال / أخرى]
KEYWORD: [الكلمة اللي تدل على الدفع أو "لا يوجد"]
NUMBER: [الرقم المحول ليه]
AMOUNT: [المبلغ بالظبط]
DATE: [التاريخ]
TIME: [الوقت]
METHOD: [طريقة الدفع]
RESULT: مقبول
أو
RESULT: مرفوض
REASON: [سبب الرفض]`;

async function analyzeReceiptWithGemini(imageBuffer) {
  if (!geminiModel) {
    throw new Error('Gemini API not initialized. Set GEMINI_API_KEY env variable.');
  }

  const base64Image = imageBuffer.toString('base64');

  const result = await geminiModel.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    },
    RECEIPT_VERIFY_PROMPT
  ]);

  const response = await result.response;
  const text = response.text();
  log('Gemini raw response: ' + text.substring(0, 500));
  return text;
}

function extractField(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function verifyReceiptData(aiResponse) {
  const aiType = extractField(aiResponse, /TYPE:\s*(.+)/);
  const aiKeyword = extractField(aiResponse, /KEYWORD:\s*(.+)/);
  const aiNumber = extractField(aiResponse, /NUMBER:\s*(.+)/);
  const aiAmount = extractField(aiResponse, /AMOUNT:\s*(.+)/);
  const aiDate = extractField(aiResponse, /DATE:\s*(.+)/);
  const aiTime = extractField(aiResponse, /TIME:\s*(.+)/);
  const aiMethod = extractField(aiResponse, /METHOD:\s*(.+)/);
  const aiResult = extractField(aiResponse, /RESULT:\s*(مقبول|مرفوض)/);
  const aiReason = extractField(aiResponse, /REASON:\s*(.+)/);

  log('AI fields: type=' + aiType + ' keyword=' + aiKeyword + ' number=' + aiNumber + ' amount=' + aiAmount + ' date=' + aiDate + ' time=' + aiTime + ' method=' + aiMethod + ' result=' + aiResult);

  const REQUIRED_NUMBER = '01028900122';
  const REQUIRED_AMOUNT = '50';

  const isPaymentReceipt = aiType.includes('إيصال') || aiType.includes('دفع') || aiType.includes('Receipt');
  const hasPaymentKeyword = aiKeyword !== 'لا يوجد' && aiKeyword !== '' && aiKeyword !== 'لايوجد';
  const numberOk = aiNumber.includes(REQUIRED_NUMBER) || aiNumber.replace(/\s/g, '').includes(REQUIRED_NUMBER);

  const amountClean = aiAmount.replace(/\s/g, '');
  const amountHas50 = amountClean.includes(REQUIRED_AMOUNT);
  const amountHas500 = amountClean.includes('500');
  const amountHas5Only = /(^|[^\d])5($|[^\d])/.test(amountClean) && !amountHas50;
  const amountOk = amountHas50 && !amountHas500 && !amountHas5Only;

  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth() + 1;
  const todayYear = now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yestDay = yesterday.getDate();
  const yestMonth = yesterday.getMonth() + 1;
  const yestYear = yesterday.getFullYear();

  const dateClean = aiDate.replace(/\s/g, '');

  const arabicMonths = {
    'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'إبريل': 4, 'مايو': 5, 'يونيو': 6,
    'يوليو': 7, 'أغسطس': 8, 'سبتمبر': 9, 'أكتوبر': 10, 'نوفمبر': 11, 'ديسمبر': 12
  };

  function checkDateMatch(day, month, year) {
    if (day === todayDay && month === todayMonth && (year === todayYear || year === undefined)) return true;
    if (day === yestDay && month === yestMonth && (year === yestYear || year === undefined)) return true;
    return false;
  }

  let dateOk = false;

  const slashMatch = dateClean.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (slashMatch) {
    const d = parseInt(slashMatch[1]);
    const m = parseInt(slashMatch[2]);
    let y = parseInt(slashMatch[3]);
    if (y < 100) y += 2000;
    dateOk = checkDateMatch(d, m, y);
  }

  if (!dateOk) {
    const isoMatch = dateClean.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (isoMatch) {
      dateOk = checkDateMatch(parseInt(isoMatch[3]), parseInt(isoMatch[2]), parseInt(isoMatch[1]));
    }
  }

  if (!dateOk) {
    for (const [monthName, monthNum] of Object.entries(arabicMonths)) {
      if (aiDate.includes(monthName)) {
        const dayMatch = aiDate.match(/(\d{1,2})/);
        const yearMatch = aiDate.match(/(\d{4})/);
        if (dayMatch) {
          dateOk = checkDateMatch(parseInt(dayMatch[1]), monthNum, yearMatch ? parseInt(yearMatch[1]) : undefined);
        }
        if (dateOk) break;
      }
    }
  }

  const timeClean = aiTime.replace(/\s/g, '');
  const timeOk = timeClean !== '' &&
    aiTime !== 'لا يوجد' &&
    aiTime !== 'لايوجد' &&
    /\d{1,2}[:.]\d{2}/.test(timeClean) &&
    parseInt(timeClean.match(/\d{1,2}/)?.[0] || '99') < 24;

  const allOk = isPaymentReceipt && hasPaymentKeyword && numberOk && amountOk && dateOk && timeOk && aiResult === 'مقبول';

  let reason = '';
  if (!isPaymentReceipt) reason = 'الصورة مش إيصال دفع';
  else if (!hasPaymentKeyword) reason = 'مفيش كلمة تدل على إن فيه دفع أو تحويل حصل (زي "تم التحويل" أو "تم الدفع")';
  else if (!numberOk && !amountOk) reason = 'الرقم والمبلغ مختلفين عن المطلوب (01028900122 - 50 جنيه)';
  else if (!numberOk) reason = 'الرقم المحول ليه مختلف عن 01028900122';
  else if (!amountOk) reason = 'المبلغ مختلف عن 50 جنيه (المبلغ في الإيصال: ' + aiAmount + ')';
  else if (!dateOk) reason = 'التاريخ مش تاريخ اليوم أو أمس (التاريخ في الإيصال: ' + aiDate + ')';
  else if (!timeOk) reason = 'مفيش وقت واضح للتحويل في الإيصال';
  else if (aiResult !== 'مقبول') reason = aiReason || 'الإيصال غير مقبول';

  return {
    verified: allOk,
    reason,
    details: {
      type: aiType,
      keyword: aiKeyword,
      number: aiNumber,
      amount: aiAmount,
      date: aiDate,
      time: aiTime,
      method: aiMethod,
      aiResult
    }
  };
}

async function handleReceipt(from, phone, msg) {
  await safeSend(from, { text: '⏳ جاري مراجعة إيصال الدفع...' });
  await new Promise(r => setTimeout(r, 1500));

  try {
    const buf = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      { logger: undefined, reuploadRequest: undefined }
    );

    log('Receipt image downloaded, size: ' + (buf.length / 1024).toFixed(1) + 'KB');

    try {
      if (!geminiModel) {
        log('Gemini not initialized, cannot verify receipt');
        userStates[phone] = 'awaiting_receipt';
        await safeSend(from, {
          text: '❌ الإيصال غير مقبول.\nالسبب: خدمة التحقق مش متاحة حالياً، حاول تاني بعد شوية\n\nتأكد إن الإيصال بيوضح:\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\n- الرقم: 01028900122\n- المبلغ: 50 جنيه بالظبط\n- تاريخ ووقت التحويل (اليوم أو أمس)\n\nأي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)\n\nأرسل صورة الإيصال الصحيحة تاني ✅'
        });
        return;
      }

      log('Sending receipt to Gemini AI for analysis...');
      const aiResponse = await analyzeReceiptWithGemini(buf);
      const result = verifyReceiptData(aiResponse);

      log('Verification result: verified=' + result.verified + ' reason=' + result.reason);

      if (result.verified) {
        const code = generateCode(phone);

        // Save to OptiSize website API
        const synced = await saveSubscriptionToWebsite(code, phone);

        userStates[phone] = 'idle';

        const syncStatus = synced ? '' : '\n⚠️ ملاحظة: الكود هيتفعل أول ما تتصل بالسيرفر';
        await safeSend(from, {
          text: '✅ تم تأكيد الدفع!\n\n🔑 كود الاشتراك: ' + code + '\n\n📌 ادخل الكود في OptiSize في مركز صحة العين\n⏰ صالح لمدة شهر\nشكراً لاشتراكك! 🙏' + syncStatus
        });
        log('Receipt ACCEPTED for ' + phone + ', code: ' + code + ', synced: ' + synced);
        return;
      }

      userStates[phone] = 'awaiting_receipt';
      await safeSend(from, {
        text: '❌ الإيصال غير مقبول.\nالسبب: ' + result.reason + '\n\nتأكد إن الإيصال بيوضح:\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\n- الرقم: 01028900122\n- المبلغ: 50 جنيه بالظبط\n- تاريخ ووقت التحويل (اليوم أو أمس)\n\nأي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)\n\nأرسل صورة الإيصال الصحيحة تاني ✅'
      });
      log('Receipt REJECTED for ' + phone + ': ' + result.reason);

    } catch (aiErr) {
      log('AI verify failed: ' + aiErr.message);
      userStates[phone] = 'awaiting_receipt';

      let reason = 'خدمة التحقق مش متاحة حالياً، حاول تاني بعد شوية';
      if (aiErr.message.includes('timeout')) reason = 'السيرفر بطيء حالياً، حاول تبعت الصورة تاني';
      else if (aiErr.message.includes('API key')) reason = 'مفيش اتصال بخدمة التحقق، حاول تاني بعد شوية';
      else if (aiErr.message.includes('quota')) reason = 'خدمة التحقق وصلت للحد المسموح، حاول تاني بعد ساعة';

      await safeSend(from, {
        text: '❌ الإيصال غير مقبول.\nالسبب: ' + reason + '\n\nتأكد إن الإيصال بيوضح:\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\n- الرقم: 01028900122\n- المبلغ: 50 جنيه بالظبط\n- تاريخ ووقت التحويل (اليوم أو أمس)\n\nأي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)\n\nأرسل صورة الإيصال الصحيحة تاني ✅'
      });
    }
  } catch (e) {
    log('Receipt download error: ' + e.message);
    userStates[phone] = 'awaiting_receipt';
    await safeSend(from, { text: '⚠️ حصل خطأ في تحميل الصورة. حاول تبعتها تاني.' });
  }
}

// ====== Process Handlers ======
process.on('uncaughtException', (err) => {
  log('Uncaught: ' + err.message);
});

process.on('unhandledRejection', (reason) => {
  log('Rejection: ' + (reason instanceof Error ? reason.message : String(reason)));
});

process.on('SIGINT', () => {
  log('SIGINT');
  stopPresenceKeepAlive();
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('SIGTERM');
  stopPresenceKeepAlive();
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('exit', () => {
  try { fs.unlinkSync(PID_FILE); } catch {}
});

// ====== STARTUP ======
log('🚀 OptiSize Bot v3.0 starting (Mini Service)...');
log('Node: ' + process.version + ' PID: ' + process.pid);
log('Port: ' + BOT_PORT);
log('Website API: ' + WEBSITE_URL);
log('GEMINI_API_KEY: ' + (GEMINI_API_KEY ? 'SET (' + GEMINI_API_KEY.substring(0, 8) + '...)' : 'NOT SET'));

checkAndWritePID();

try {
  if (fs.existsSync(LOG_FILE)) {
    const stat = fs.statSync(LOG_FILE);
    if (stat.size > 50000) {
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      fs.writeFileSync(LOG_FILE, content.slice(-20000));
    }
  }
} catch {}

loadLidMappings();
