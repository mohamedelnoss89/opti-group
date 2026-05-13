// ====== OptiSize WhatsApp Bot - Groq AI (Llama 4 Scout) ======
// كود جديد ومتصلح بالكامل مع توصيل API للموقع

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
const https = require('https');
const Groq = require('groq-sdk');
const QRCode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');

// ====== Groq AI Setup ======
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
let groq = null;

function initGroq() {
  if (!GROQ_API_KEY) {
    log('WARNING: GROQ_API_KEY not set!');
    log('Get a free key from: https://console.groq.com');
    return false;
  }
  try {
    groq = new Groq({ apiKey: GROQ_API_KEY });
    log('AI: Groq (Llama 4 Scout) initialized OK');
    return true;
  } catch (e) {
    log('AI: Groq init failed: ' + e.message);
    return false;
  }
}

// ====== Website API Config ======
// URL of the OptiSize website API (change to your deployed URL)
const WEBSITE_API_URL = process.env.WEBSITE_API_URL || 'http://localhost:3000';
const BOT_API_SECRET = process.env.BOT_API_SECRET || 'optisize-bot-secret-2026';

// ====== Paths ======
const CODES_FILE = path.join(__dirname, 'subscription_codes.json');
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
    log('Loaded ' + Object.keys(lidMap).length + ' LID mappings');
  } catch (e) { log('LID mappings: ' + e.message); }
}

function resolveLidToPhone(lid) {
  const lidNum = lid.replace('@lid', '');
  if (lidMap[lidNum]) return lidMap[lidNum];
  try {
    const f = path.join(AUTH_PATH, 'lid-mapping-' + lidNum + '_reverse.json');
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

// ====== PID Lock ======
function checkAndWritePID() {
  try {
    if (fs.existsSync(PID_FILE)) {
      const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim());
      if (oldPid && !isNaN(oldPid)) {
        try { process.kill(oldPid, 0); console.log('Another bot running (PID ' + oldPid + ')'); process.exit(1); } catch {}
      }
    }
    fs.writeFileSync(PID_FILE, String(process.pid));
  } catch (e) {}
}

// ====== Logging ======
function log(msg) {
  const ts = new Date().toISOString();
  const line = '[' + ts + '] ' + msg;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

// ====== File Helpers ======
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
    code = letters[Math.floor(Math.random()*26)] + letters[Math.floor(Math.random()*26)] + letters[Math.floor(Math.random()*26)] + last4 + Math.floor(Math.random()*10);
  } while (codes[code]);
  return code;
}

// ====== Save Subscription to Website API ======
async function saveSubscriptionToWebsite(code, phone) {
  // Always save locally first as backup
  const c = loadCodes();
  c[code] = { phone, createdAt: new Date().toISOString(), activated: false };
  saveCodes(c);
  log('Code saved locally: ' + code);

  // Try to push to website API
  try {
    const apiUrl = WEBSITE_API_URL + '/api/subscriptions/create';
    const payload = JSON.stringify({ code, phone, secret: BOT_API_SECRET });

    const urlObj = new URL(apiUrl);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 10000,
      };

      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.success) {
              log('Code pushed to website API: ' + code);
              resolve(true);
            } else {
              log('Website API error: ' + (result.error || 'unknown'));
              resolve(false);
            }
          } catch (e) {
            log('Website API parse error: ' + e.message);
            resolve(false);
          }
        });
      });

      req.on('error', (e) => {
        log('Website API connection error: ' + e.message);
        resolve(false);
      });

      req.on('timeout', () => {
        log('Website API timeout');
        req.destroy();
        resolve(false);
      });

      req.write(payload);
      req.end();
    });
  } catch (e) {
    log('Website API error: ' + e.message);
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
  if (!sock || !botConnected) return false;
  const phone = jid.replace('@s.whatsapp.net', '').replace('@lid', '');
  if (isRateLimited(phone)) { log('Rate limited: ' + phone); return false; }
  try {
    await sock.sendMessage(jid, content);
    recordMsgSent(phone);
    log('Sent to ' + phone);
    return true;
  } catch (e) { log('Send error: ' + e.message); return false; }
}

// ====== QR Code Storage ======
let currentQRCode = null;

// ====== HTTP API ======
http.createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/qr') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (botConnected) {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#1a1a2e;color:#eee"><div style="text-align:center"><h1>✅ Bot Connected!</h1></div></body></html>');
    } else if (currentQRCode) {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#1a1a2e;color:#eee"><div style="text-align:center"><h2>📱 Scan QR Code</h2><img src="' + currentQRCode + '" style="border:10px solid white;border-radius:10px;margin:20px"/></div></body></html>');
    } else {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#1a1a2e;color:#eee"><div style="text-align:center"><h2>⏳ Starting...</h2></div></body></html>');
    }
    return;
  }
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ connected: botConnected, groqReady: !!groq }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));
}).listen(8787, '0.0.0.0', () => {
  log('API on :8787');
  initGroq();
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
      printQRInTerminal: false,
      browser: ['OptiSize Bot', 'Chrome', '1.0'],
      markOnlineOnConnect: true,
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 30000,
      generateHighQualityLinkPreview: false,
      emitOwnEvents: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        botConnected = false;
        currentQRCode = null;
        console.log('\n========== QR CODE ==========');
        qrcodeTerminal.generate(qr, { small: true });
        console.log('==============================\n');
        try {
          currentQRCode = await QRCode.toDataURL(qr, { width: 400, margin: 2 });
          log('QR code generated for web display');
        } catch (e) {}
      }

      if (connection === 'close') {
        botConnected = false;
        stopPresenceKeepAlive();
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        log('Connection closed. Status: ' + statusCode);
        if (statusCode !== DisconnectReason.loggedOut && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          const delay = Math.min(5000 * reconnectAttempts, 60000);
          log('Reconnecting in ' + (delay/1000) + 's...');
          setTimeout(startWA, delay);
        }
      }

      if (connection === 'open') {
        botConnected = true;
        currentQRCode = null;
        reconnectAttempts = 0;
        log('WHATSAPP CONNECTED!');
        startPresenceKeepAlive();
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        const m = messages[0];
        if (!m || !m.message || m.key.fromMe) return;
        const from = m.key.remoteJid;
        const msgId = m.key.id;
        if (isDuplicate(msgId)) return;
        if (type !== 'notify' && type !== 'append') return;
        if (from.endsWith('@g.us') || from.endsWith('@newsletter')) return;

        let phone = '';
        let respondTo = from;
        if (from.endsWith('@s.whatsapp.net')) {
          phone = from.replace('@s.whatsapp.net', '');
        } else if (from.endsWith('@lid')) {
          const resolvedPhone = resolveLidToPhone(from);
          if (resolvedPhone) { phone = resolvedPhone; respondTo = resolvedPhone + '@s.whatsapp.net'; }
          else { phone = from.replace('@lid', ''); respondTo = from; }
        } else return;

        if (!canRespond(phone)) return;

        const text = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || '';
        log('DM from ' + phone + ': ' + (text || '[IMAGE]'));

        await new Promise(r => setTimeout(r, 800));
        try { await sock.readMessages([m.key]); } catch {}
        try { await sock.sendPresenceUpdate('composing', respondTo); } catch {}
        await new Promise(r => setTimeout(r, Math.min(Math.max(TYPING_DELAY_MS, text.length * 30), 2500)));
        recordResponse(phone);

        if (ownerChatActive[phone]) {
          if (text.trim() === 'انتهى' || text.trim() === 'انهى') {
            ownerChatActive[phone] = false;
            await safeSend(respondTo, { text: 'شكراً! 🙏' });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }

        if (m.message?.imageMessage) {
          if (userStates[phone] === 'awaiting_receipt') {
            await handleReceipt(respondTo, phone, m);
          } else {
            await safeSend(respondTo, { text: WELCOME });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }

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
        log('Handler error: ' + err.message);
      }
    });
  } catch (err) {
    log('startWA error: ' + err.message);
    if (reconnectAttempts < MAX_RECONNECT) {
      reconnectAttempts++;
      setTimeout(startWA, Math.min(5000 * reconnectAttempts, 60000));
    }
  }
}

// ====== Receipt AI Prompt (English to avoid encoding issues) ======
const RECEIPT_VERIFY_PROMPT = `You are a strict payment receipt verification system. Analyze this image carefully.

STEP 1: First check if this is a REAL payment receipt from an actual app
- Look for real app UI elements: navigation bars, app logos, status bars, proper formatting
- Real payment apps include: Vodafone Cash, InstaPay, CIB, NBE, Fawry, etc.
- If the image looks like a screenshot edited in another app, a handwritten note, a plain text document, or fabricated in any way -> it is FAKE
- Real receipts must show actual mobile app interface with proper UI elements

STEP 2: Extract the following data from the receipt
1. TYPE: Is this a "real" payment receipt or a "fake" one?
2. KEYWORD: Any word indicating payment was made (e.g., "sent", "transferred", "paid", "تم التحويل", "تم الدفع", "مرسل")
3. NUMBER: The phone number or account that received the money
4. AMOUNT: The exact amount transferred
5. DATE: The date of the transaction
6. TIME: The time of the transaction
7. METHOD: Payment method used (Vodafone Cash, InstaPay, bank transfer, etc.)

STEP 3: Verify the data
- The number MUST be exactly 01028900122
- The amount MUST be exactly 50 EGP - any other amount is rejected
- The date MUST be today or yesterday only
- The time must be present and clear
- Payment method can be any legitimate method

IMPORTANT WARNINGS:
- If this looks like a fabricated or edited image -> REJECT
- If amount is not exactly 50 EGP -> REJECT
- If date is older than yesterday -> REJECT
- If no payment keyword found -> REJECT
- If no real app UI elements visible -> REJECT as FAKE

Answer in EXACTLY this format:
TYPE: [real / fake]
KEYWORD: [payment keyword found or "none"]
NUMBER: [phone number]
AMOUNT: [exact amount]
DATE: [date]
TIME: [time]
METHOD: [payment method]
RESULT: accepted
or
RESULT: rejected
REASON: [rejection reason]`;

// ====== Groq AI Analysis ======
async function analyzeWithGroq(imageBuffer) {
  if (!groq) throw new Error('Groq API not initialized');
  const b64 = imageBuffer.toString('base64');

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const resp = await groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } },
            { type: 'text', text: RECEIPT_VERIFY_PROMPT }
          ]
        }],
        max_tokens: 500
      });

      const text = resp.choices[0]?.message?.content || '';
      log('Groq response (attempt ' + attempt + '): ' + text.substring(0, 300));
      return text;
    } catch (e) {
      const isQuotaError = e.message && (e.message.includes('429') || e.message.includes('rate') || e.message.includes('quota'));
      const isModelError = e.message && (e.message.includes('404') || e.message.includes('decommissioned'));

      if (isModelError) {
        log('Model not available, trying llama-3.2-11b-vision-preview...');
        try {
          const resp = await groq.chat.completions.create({
            model: 'llama-3.2-11b-vision-preview',
            messages: [{
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } },
                { type: 'text', text: RECEIPT_VERIFY_PROMPT }
              ]
            }],
            max_tokens: 500
          });
          const text = resp.choices[0]?.message?.content || '';
          log('Fallback model response: ' + text.substring(0, 300));
          return text;
        } catch (e2) {
          log('Fallback model also failed: ' + e2.message);
          throw e2;
        }
      }

      if (isQuotaError && attempt < 3) {
        const waitTime = attempt * 15000;
        log('Rate limited, waiting ' + (waitTime/1000) + 's (attempt ' + attempt + '/3)...');
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw e;
      }
    }
  }
  throw new Error('All retry attempts failed');
}

// ====== Receipt Verification ======
function extractField(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function verifyReceiptData(aiResponse) {
  const aiType = extractField(aiResponse, /TYPE:\s*(.+)/i);
  const aiKeyword = extractField(aiResponse, /KEYWORD:\s*(.+)/i);
  const aiNumber = extractField(aiResponse, /NUMBER:\s*(.+)/i);
  const aiAmount = extractField(aiResponse, /AMOUNT:\s*(.+)/i);
  const aiDate = extractField(aiResponse, /DATE:\s*(.+)/i);
  const aiTime = extractField(aiResponse, /TIME:\s*(.+)/i);
  const aiMethod = extractField(aiResponse, /METHOD:\s*(.+)/i);
  const aiResult = extractField(aiResponse, /RESULT:\s*(accepted|rejected)/i);
  const aiReason = extractField(aiResponse, /REASON:\s*(.+)/i);

  log('AI: type=' + aiType + ' keyword=' + aiKeyword + ' number=' + aiNumber + ' amount=' + aiAmount + ' date=' + aiDate + ' time=' + aiTime + ' result=' + aiResult);

  const REQUIRED_NUMBER = '01028900122';
  const REQUIRED_AMOUNT = '50';

  // Check if receipt is real (not fake)
  const t = aiType.toLowerCase();
  const isReal = t.includes('real') && !t.includes('fake');
  if (!isReal) {
    return { verified: false, reason: 'الإيصال مش حقيقي - لازم يكون من تطبيق دفع حقيقي (فودافون كاش / إنستاباي / بنك)' };
  }

  // Check for payment keyword
  const hasPaymentKeyword = aiKeyword.toLowerCase() !== 'none' && aiKeyword !== '' && aiKeyword !== 'لا يوجد';
  if (!hasPaymentKeyword) {
    return { verified: false, reason: 'مفيش كلمة تدل على إن فيه دفع أو تحويل حصل' };
  }

  // Check phone number
  const numberOk = aiNumber.includes(REQUIRED_NUMBER) || aiNumber.replace(/\s/g, '').includes(REQUIRED_NUMBER);
  if (!numberOk) {
    return { verified: false, reason: 'الرقم المحول ليه مختلف عن 01028900122' };
  }

  // Check amount
  const amountClean = aiAmount.replace(/\s/g, '');
  const amountHas50 = amountClean.includes(REQUIRED_AMOUNT);
  const amountHas500 = amountClean.includes('500');
  const amountHas5Only = /(^|[^\d])5($|[^\d])/.test(amountClean) && !amountHas50;
  const amountOk = amountHas50 && !amountHas500 && !amountHas5Only;
  if (!amountOk) {
    return { verified: false, reason: 'المبلغ مختلف عن 50 جنيه (المبلغ: ' + aiAmount + ')' };
  }

  // Check date
  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth() + 1;
  const todayYear = now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateClean = aiDate.replace(/\s/g, '');
  const arabicMonths = { 'يناير':1,'فبراير':2,'مارس':3,'أبريل':4,'إبريل':4,'مايو':5,'يونيو':6,'يوليو':7,'أغسطس':8,'سبتمبر':9,'أكتوبر':10,'نوفمبر':11,'ديسمبر':12 };
  // English months
  const englishMonths = { 'jan':1,'feb':2,'mar':3,'apr':4,'may':5,'jun':6,'jul':7,'aug':8,'sep':9,'oct':10,'nov':11,'dec':12 };

  function checkDateMatch(day, month, year) {
    if (day === todayDay && month === todayMonth && (year === todayYear || year === undefined)) return true;
    if (day === yesterday.getDate() && month === yesterday.getMonth()+1 && (year === yesterday.getFullYear() || year === undefined)) return true;
    return false;
  }

  let dateOk = false;
  // DD/MM/YYYY or DD-MM-YYYY
  const slashMatch = dateClean.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (slashMatch) {
    let y = parseInt(slashMatch[3]); if (y < 100) y += 2000;
    dateOk = checkDateMatch(parseInt(slashMatch[1]), parseInt(slashMatch[2]), y);
  }
  // YYYY/MM/DD or YYYY-MM-DD
  if (!dateOk) {
    const isoMatch = dateClean.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (isoMatch) dateOk = checkDateMatch(parseInt(isoMatch[3]), parseInt(isoMatch[2]), parseInt(isoMatch[1]));
  }
  // Arabic month names
  if (!dateOk) {
    for (const [monthName, monthNum] of Object.entries(arabicMonths)) {
      if (aiDate.includes(monthName)) {
        const dayMatch = aiDate.match(/(\d{1,2})/);
        const yearMatch = aiDate.match(/(\d{4})/);
        if (dayMatch) { dateOk = checkDateMatch(parseInt(dayMatch[1]), monthNum, yearMatch ? parseInt(yearMatch[1]) : undefined); }
        if (dateOk) break;
      }
    }
  }
  // English month names
  if (!dateOk) {
    for (const [monthName, monthNum] of Object.entries(englishMonths)) {
      if (aiDate.toLowerCase().includes(monthName)) {
        const dayMatch = aiDate.match(/(\d{1,2})/);
        const yearMatch = aiDate.match(/(\d{4})/);
        if (dayMatch) { dateOk = checkDateMatch(parseInt(dayMatch[1]), monthNum, yearMatch ? parseInt(yearMatch[1]) : undefined); }
        if (dateOk) break;
      }
    }
  }

  if (!dateOk) {
    return { verified: false, reason: 'التاريخ مش تاريخ اليوم أو أمس (التاريخ: ' + aiDate + ')' };
  }

  // Check time
  const timeClean = aiTime.replace(/\s/g, '');
  const timeOk = timeClean !== '' && aiTime.toLowerCase() !== 'none' && aiTime !== 'لا يوجد' && /\d{1,2}[:.]\d{2}/.test(timeClean);
  if (!timeOk) {
    return { verified: false, reason: 'مفيش وقت واضح للتحويل' };
  }

  // All checks passed
  return { verified: true, reason: '' };
}

// ====== Receipt Handler ======
async function handleReceipt(from, phone, msg) {
  await safeSend(from, { text: '⏳ جاري مراجعة إيصال الدفع...' });
  await new Promise(r => setTimeout(r, 1500));

  try {
    const buf = await downloadMediaMessage(msg, 'buffer', {}, { logger: undefined, reuploadRequest: undefined });
    log('Receipt downloaded: ' + (buf.length / 1024).toFixed(1) + 'KB');

    if (!groq) {
      userStates[phone] = 'awaiting_receipt';
      await safeSend(from, { text: '❌ الإيصال غير مقبول.\nالسبب: خدمة التحقق مش متاحة - لازم تضيف GROQ_API_KEY\n\nأرسل الإيصال تاني بعد إضافة المفتاح ✅' });
      return;
    }

    try {
      log('Sending receipt to Groq (Llama 4 Scout)...');
      const aiResponse = await analyzeWithGroq(buf);
      const result = verifyReceiptData(aiResponse);
      log('Result: verified=' + result.verified + ' reason=' + result.reason);

      if (result.verified) {
        const code = generateCode(phone);
        // Save to website API and locally
        const apiResult = await saveSubscriptionToWebsite(code, phone);
        if (apiResult) {
          log('Code synced to website: ' + code);
        } else {
          log('Code saved locally only (website unreachable): ' + code);
        }
        userStates[phone] = 'idle';
        await safeSend(from, { text: '✅ تم تأكيد الدفع!\n\n🔑 كود الاشتراك: ' + code + '\n\nادخل الكود في OptiSize في مركز صحة العين\n⏰ صالح لمدة شهر\nشكراً لاشتراكك! 🙏' });
        log('Receipt ACCEPTED for ' + phone + ', code: ' + code);
        return;
      }

      userStates[phone] = 'awaiting_receipt';
      await safeSend(from, { text: '❌ الإيصال غير مقبول.\nالسبب: ' + result.reason + '\n\nتأكد إن الإيصال بيوضح:\n- إنه من تطبيق دفع حقيقي (مش مصنوع)\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\n- الرقم: 01028900122\n- المبلغ: 50 جنيه بالظبط\n- تاريخ ووقت التحويل (اليوم أو أمس)\n\nأي طريقة دفع مقبولة\n\nأرسل صورة الإيصال الصحيحة تاني ✅' });
      log('Receipt REJECTED for ' + phone + ': ' + result.reason);

    } catch (aiErr) {
      log('AI verify failed: ' + aiErr.message);
      userStates[phone] = 'awaiting_receipt';
      let reason = 'خدمة التحقق مش متاحة حالياً، حاول تاني بعد شوية';
      if (aiErr.message.includes('timeout')) reason = 'السيرفر بطيء حالياً، حاول تبعت الصورة تاني';
      else if (aiErr.message.includes('API key') || aiErr.message.includes('API_KEY')) reason = 'مفتاح API مش صحيح، تواصل مع الإدارة';
      else if (aiErr.message.includes('429') || aiErr.message.includes('rate') || aiErr.message.includes('quota')) reason = 'خدمة التحقق وصلت للحد، حاول بعد دقيقة';
      else if (aiErr.message.includes('404') || aiErr.message.includes('decommissioned')) reason = 'موديل AI مش متاح حالياً، حاول تاني';
      await safeSend(from, { text: '❌ الإيصال غير مقبول.\nالسبب: ' + reason + '\n\nأرسل الإيصال تاني ✅' });
    }
  } catch (e) {
    log('Receipt download error: ' + e.message);
    userStates[phone] = 'awaiting_receipt';
    await safeSend(from, { text: '⚠️ حصل خطأ في تحميل الصورة. حاول تبعتها تاني.' });
  }
}

// ====== Process Handlers ======
process.on('uncaughtException', (err) => { log('Uncaught: ' + err.message); });
process.on('unhandledRejection', (reason) => { log('Rejection: ' + (reason instanceof Error ? reason.message : String(reason))); });
process.on('SIGINT', () => { stopPresenceKeepAlive(); try { fs.unlinkSync(PID_FILE); } catch {} process.exit(0); });
process.on('SIGTERM', () => { stopPresenceKeepAlive(); try { fs.unlinkSync(PID_FILE); } catch {} process.exit(0); });

// ====== STARTUP ======
log('OptiSize Bot starting (Groq - Llama 4 Scout)...');
log('Node: ' + process.version + ' PID: ' + process.pid);
log('GROQ_API_KEY: ' + (GROQ_API_KEY ? 'SET (' + GROQ_API_KEY.substring(0, 8) + '...)' : 'NOT SET'));
log('WEBSITE_API_URL: ' + WEBSITE_API_URL);
checkAndWritePID();
loadLidMappings();
