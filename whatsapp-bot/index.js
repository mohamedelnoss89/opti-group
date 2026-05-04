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
حول 50 جنيه على رقم:
📱 01028900122

(فودافون كاش / إنستاباي / أي طريقة تحويل)

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
}).listen(process.env.PORT || 8787, '0.0.0.0', () => {
  log('🌐 API on :' + (process.env.PORT || 8787));
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

// ====== Receipt Handler (STRICT AI + Code Verification) ======
const RECEIPT_VERIFY_PROMPT = `أنت نظام تحقق صارم من إيصالات الدفع والتحويل.

الخطوة 1: أولاً تأكد إن الصورة دي فعلاً إيصال دفع أو تحويل
- لازم تشوف كلمات تدل على الدفع أو التحويل زي: "تم التحويل" أو "مرسل" أو "تم الإرسال" أو "تحويل ناجح" أو "تم الدفع" أو "دفع ناجح" أو "Sent" أو "Transferred" أو "Payment" أو "Paid"
- لو مفيش كلمات تدل على إن فيه دفع أو تحويل حصل → مش إيصال دفع → مرفوض

الخطوة 2: استخرج البيانات من الإيصال
1. الرقم المحول ليه أو رقم المستقبل
2. المبلغ المحول بالظبط
3. تاريخ التحويل (يوم/شهر/سنة)
4. وقت التحويل (ساعة:دقيقة)
5. طريقة الدفع (فودافون كاش / إنستاباي / تحويل بنكي / غيرها)

الخطوة 3: تحقق من البيانات
- الرقم لازم يكون 01028900122 بالظبط
- المبلغ لازم يكون 50 جنيه بالظبط - لو أي مبلغ تاني → مرفوض
- التاريخ لازم يكون تاريخ اليوم أو أمس فقط - لو التاريخ أقدم من كده → مرفوض
- الوقت لازم يكون موجود وواضح
- طريقة الدفع ممكن تكون أي طريقة (فودافون كاش، إنستاباي، تحويل بنكي، إلخ)

⚠️ تحذيرات مهمة:
- لو المبلغ مش 50 جنيه بالظبط → مرفوض (حتى لو 5 أو 10 أو 100)
- لو التاريخ أقدم من أمس → مرفوض
- لو مفيش كلمة تدل على الدفع أو التحويل → مرفوض
- لو الصورة مش إيصال دفع → مرفوض
- طريقة الدفع مش شرط تكون فودافون كاش - أي طريقة مقبولة

أجب بالتنسيق ده بالظبط:
TYPE: [إيصال دفع / مش إيصال / أخرى]
KEYWORD: [الكلمة اللي تدل على الدفع أو "لا يوجد"]
NUMBER: [الرقم المحول ليه]
AMOUNT: [المبلغ بالظبط]
DATE: [التاريخ]
TIME: [الوقت]
METHOD: [طريقة الدفع]
RESULT: مقبول
أو
TYPE: [...]
KEYWORD: [...]
NUMBER: [...]
AMOUNT: [...]
DATE: [...]
TIME: [...]
METHOD: [...]
RESULT: مرفوض
REASON: [سبب الرفض]`;

async function handleReceipt(from, phone, msg) {
  await safeSend(from, { text: '⏳ جاري مراجعة إيصال الدفع...' });
  await new Promise(r => setTimeout(r, 1500));
  
  try {
    // Download the image
    const buf = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      { logger: undefined, reuploadRequest: undefined }
    );
    
    log('📸 Receipt image downloaded, size: ' + (buf.length / 1024).toFixed(1) + 'KB');
    
    // AI verification - STRICT (must use createVision for images!)
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      const b64 = buf.toString('base64');
      
      const r = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: RECEIPT_VERIFY_PROMPT },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } }
            ]
          }
        ],
        thinking: { type: 'disabled' }
      });
      
      const aiResponse = r.choices[0]?.message?.content || '';
      log('🤖 AI response: ' + aiResponse);
      
      // ====== TRIPLE VERIFICATION: AI + Keyword + Code ======
      // 1. Extract ALL data from AI response
      const typeMatch = aiResponse.match(/TYPE:\s*(.+)/);
      const keywordMatch = aiResponse.match(/KEYWORD:\s*(.+)/);
      const numberMatch = aiResponse.match(/NUMBER:\s*(.+)/);
      const amountMatch = aiResponse.match(/AMOUNT:\s*(.+)/);
      const dateMatch = aiResponse.match(/DATE:\s*(.+)/);
      const timeMatch = aiResponse.match(/TIME:\s*(.+)/);
      const methodMatch = aiResponse.match(/METHOD:\s*(.+)/);
      const resultMatch = aiResponse.match(/RESULT:\s*(مقبول|مرفوض)/);
      const reasonMatch = aiResponse.match(/REASON:\s*(.+)/);
      
      const aiType = typeMatch ? typeMatch[1].trim() : '';
      const aiKeyword = keywordMatch ? keywordMatch[1].trim() : '';
      const aiNumber = numberMatch ? numberMatch[1].trim() : '';
      const aiAmount = amountMatch ? amountMatch[1].trim() : '';
      const aiDate = dateMatch ? dateMatch[1].trim() : '';
      const aiTime = timeMatch ? timeMatch[1].trim() : '';
      const aiMethod = methodMatch ? methodMatch[1].trim() : '';
      const aiResult = resultMatch ? resultMatch[1].trim() : '';
      const aiReason = reasonMatch ? reasonMatch[1].trim() : '';
      
      log(`🔍 Extracted: type=${aiType} keyword=${aiKeyword} number=${aiNumber} amount=${aiAmount} date=${aiDate} time=${aiTime} method=${aiMethod} result=${aiResult}`);
      
      // 2. CODE-LEVEL VERIFICATION
      const REQUIRED_NUMBER = '01028900122';
      const REQUIRED_AMOUNT = '50';
      
      // Check: Must be a payment receipt (any method - not just Vodafone)
      const isPaymentReceipt = aiType.includes('إيصال') || aiType.includes('دفع') || aiType.includes('Receipt');
      
      // Check: Must have a payment/transfer keyword
      const hasPaymentKeyword = aiKeyword !== 'لا يوجد' && aiKeyword !== '' && aiKeyword !== 'لايوجد';
      
      // Check: Number must be correct
      const numberOk = aiNumber.includes(REQUIRED_NUMBER) || aiNumber.replace(/\s/g, '').includes(REQUIRED_NUMBER);
      
      // Check: Amount must be exactly 50
      const amountClean = aiAmount.replace(/\s/g, '');
      const amountHas50 = amountClean.includes(REQUIRED_AMOUNT);
      const amountHas500 = amountClean.includes('500');
      const amountHas5Only = /(^|[^\d])5($|[^\d])/.test(amountClean) && !amountHas50;
      const amountOk = amountHas50 && !amountHas500 && !amountHas5Only;
      
      // Check: Date must be recent (today or yesterday)
      const now = new Date();
      const todayDay = now.getDate();
      const todayMonth = now.getMonth() + 1;
      const todayYear = now.getFullYear();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yestDay = yesterday.getDate();
      const yestMonth = yesterday.getMonth() + 1;
      const yestYear = yesterday.getFullYear();
      
      // Robust date check: extract all digit sequences and check against today/yesterday
      const dateClean = aiDate.replace(/\s/g, '');
      
      // Arabic month names mapping
      const arabicMonths = {
        'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'إبريل': 4, 'مايو': 5, 'يونيو': 6,
        'يوليو': 7, 'أغسطس': 8, 'سبتمبر': 9, 'أكتوبر': 10, 'نوفمبر': 11, 'ديسمبر': 12
      };
      
      function checkDateMatch(day, month, year) {
        // Check against today
        if (day === todayDay && month === todayMonth && (year === todayYear || year === undefined)) return true;
        // Check against yesterday
        if (day === yestDay && month === yestMonth && (year === yestYear || year === undefined)) return true;
        return false;
      }
      
      let dateOk = false;
      
      // Try format: dd/mm/yyyy or dd-mm-yyyy or d/m/yy etc.
      const slashMatch = dateClean.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      if (slashMatch) {
        const d = parseInt(slashMatch[1]);
        const m = parseInt(slashMatch[2]);
        let y = parseInt(slashMatch[3]);
        if (y < 100) y += 2000;
        dateOk = checkDateMatch(d, m, y);
      }
      
      // Try format: yyyy/mm/dd or yyyy-mm-dd
      if (!dateOk) {
        const isoMatch = dateClean.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
        if (isoMatch) {
          const y = parseInt(isoMatch[1]);
          const m = parseInt(isoMatch[2]);
          const d = parseInt(isoMatch[3]);
          dateOk = checkDateMatch(d, m, y);
        }
      }
      
      // Try Arabic month names (e.g. "4مايو2026" or "4 مايو 2026")
      if (!dateOk) {
        for (const [monthName, monthNum] of Object.entries(arabicMonths)) {
          if (aiDate.includes(monthName)) {
            const dayMatch = aiDate.match(/(\d{1,2})/);
            const yearMatch = aiDate.match(/(\d{4})/);
            if (dayMatch) {
              const d = parseInt(dayMatch[1]);
              const y = yearMatch ? parseInt(yearMatch[1]) : undefined;
              dateOk = checkDateMatch(d, monthNum, y);
            }
            if (dateOk) break;
          }
        }
      }
      
      // Try dd/mm or d/m without year
      if (!dateOk) {
        const shortMatch = dateClean.match(/(\d{1,2})[\/\-](\d{1,2})/);
        if (shortMatch && !slashMatch) {
          const d = parseInt(shortMatch[1]);
          const m = parseInt(shortMatch[2]);
          if (m <= 12 && d <= 31) {
            dateOk = checkDateMatch(d, m, undefined);
          }
        }
      }
      
      // Check: Time must be present and look like a real time (HH:MM or similar)
      const timeClean = aiTime.replace(/\s/g, '');
      const timeOk = timeClean !== '' && 
                     aiTime !== 'لا يوجد' && 
                     aiTime !== 'لايوجد' && 
                     /\d{1,2}[:.]\d{2}/.test(timeClean) &&  // Must have HH:MM or HH.MM pattern
                     parseInt(timeClean.match(/\d{1,2}/)?.[0] || '99') < 24;  // Hour must be valid
      
      // 3. Final decision: ALL 5 checks must pass + AI must agree
      // Checks: (1) payment receipt (2) payment keyword (3) phone number (4) amount (5) date (6) time
      // Payment method can be ANY method (Vodafone Cash, Instapay, Fawry, bank transfer, etc.)
      const allOk = isPaymentReceipt && hasPaymentKeyword && numberOk && amountOk && dateOk && timeOk && aiResult === 'مقبول';
      
      log(`✅ Checks: receipt=${isPaymentReceipt} keyword=${hasPaymentKeyword} number=${numberOk} amount=${amountOk} date=${dateOk} time=${timeOk} method=${aiMethod} aiResult=${aiResult}`);
      log(`📅 Date details: aiDate="${aiDate}" today=${todayDay}/${todayMonth}/${todayYear} yesterday=${yestDay}/${yestMonth}/${yestYear} dateOk=${dateOk}`);
      log(`⏰ Time details: aiTime="${aiTime}" timeOk=${timeOk}`);
      
      if (allOk) {
        const code = generateCode(phone);
        await saveSubscriptionToDB(code, phone);
        userStates[phone] = 'idle';
        await safeSend(from, { text: `✅ تم تأكيد الدفع!\n\n🔑 كود الاشتراك: ${code}\n\nادخل الكود في OptiSize في مركز صحة العين\n⏰ صالح لمدة شهر\nشكراً لاشتراكك! 🙏` });
        log('✅ Receipt ACCEPTED for ' + phone + ', code: ' + code);
        return;
      }
      
      // Rejected - give SPECIFIC reason
      let reason = '';
      if (!isPaymentReceipt) {
        reason = 'الصورة مش إيصال دفع';
      } else if (!hasPaymentKeyword) {
        reason = 'مفيش كلمة تدل على إن فيه دفع أو تحويل حصل (زي "تم التحويل" أو "تم الدفع")';
      } else if (!numberOk && !amountOk) {
        reason = 'الرقم والمبلغ مختلفين عن المطلوب (01028900122 - 50 جنيه)';
      } else if (!numberOk) {
        reason = 'الرقم المحول ليه مختلف عن 01028900122';
      } else if (!amountOk) {
        reason = 'المبلغ مختلف عن 50 جنيه (المبلغ في الإيصال: ' + aiAmount + ')';
      } else if (!dateOk) {
        reason = 'التاريخ مش تاريخ اليوم أو أمس (التاريخ في الإيصال: ' + aiDate + ')';
      } else if (!timeOk) {
        reason = 'مفيش وقت واضح للتحويل في الإيصال';
      } else if (aiResult !== 'مقبول') {
        reason = aiReason || 'الإيصال غير مقبول';
      }
      
      userStates[phone] = 'awaiting_receipt';
      await safeSend(from, { 
        text: `❌ الإيصال غير مقبول.\nالسبب: ${reason}\n\nتأكد إن الإيصال بيوضح:\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\n- الرقم: 01028900122\n- المبلغ: 50 جنيه بالظبط\n- تاريخ ووقت التحويل (اليوم أو أمس)\n\nأي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)\n\nأرسل صورة الإيصال الصحيحة تاني ✅` 
      });
      log('❌ Receipt REJECTED for ' + phone + ': ' + reason);
      
    } catch (aiErr) {
      // CRITICAL: If AI fails, DO NOT auto-accept! Send to manual review instead
      log('⚠️ AI verify failed: ' + aiErr.message + ' - Sending to manual review');
      userStates[phone] = 'idle'; // Reset state so they can try again
      await safeSend(from, { 
        text: '⚠️ حصلت مشكلة في مراجعة الإيصال تلقائياً.\n\nسيتم مراجعة الإيصال يدوياً من فريق الدعم.\nلو مقبول هنوصلك بالكود خلال ساعة.\n\nلو عايز تبعت إيصال تاني اكتب: اشتراك' 
      });
      // DO NOT generate code here - must be manual review
    }
  } catch (e) {
    log('❌ Receipt download error: ' + e.message);
    userStates[phone] = 'awaiting_receipt'; // Keep state so they can retry
    await safeSend(from, { text: '⚠️ حصل خطأ في تحميل الصورة. حاول تبعتها تاني.' });
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
