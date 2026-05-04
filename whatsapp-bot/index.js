const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CODES_FILE = path.join(__dirname, 'subscription_codes.json');
const PAIRING_FILE = path.join(__dirname, '..', 'public', 'pairing.json');

let userStates = {};
let ownerChatActive = {};
let botConnected = false;
let sock = null;
let presenceInterval = null;

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
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try { await prisma.subscription.create({ data: { code, phone, isActive: false } }); }
  catch (e) { const c = loadCodes(); c[code] = { phone, createdAt: new Date().toISOString(), activated: false }; saveCodes(c); }
  finally { await prisma.$disconnect(); }
}

const WELCOME = `مرحباً بك في OptiSize! 👁️\n\nكيف يمكنني مساعدتك؟\n\n1️⃣ اشتراك - اشترك في مركز صحة العين VIP\n2️⃣ تحدث - تحدث مع فريق الدعم\n\nأرسل الرقم أو الكلمة 👇`;
const SUB_INFO = `💎 اشتراك مركز صحة العين VIP\n\nقيمة الاشتراك: 50 جنيه شهرياً\n\n💰 طريقة الدفع:\nحول 50 جنيه على رقم فودافون كاش:\n📱 01028900122\n\nبعد الدفع أرسل صورة تأكيد الدفع هنا ✅`;
const PAY_CONFIRM = `📸 أرسل صورة تأكيد الدفع الآن\n\nملاحظة: تأكد أن الصورة توضح:\n- الرقم المحول ليه (01028900122)\n- المبلغ (50 جنيه)\n- تاريخ ووقت التحويل`;

// Set bot as online/available and keep it that way
async function setOnline() {
  if (!sock) return;
  try {
    await sock.sendPresenceUpdate('available');
    console.log('🟢 Bot set to online/available');
  } catch (e) {
    console.error('Failed to set online:', e.message);
  }
}

// Keep presence alive - resend every 60 seconds
function startPresenceKeepAlive() {
  if (presenceInterval) clearInterval(presenceInterval);
  setOnline(); // Set immediately
  presenceInterval = setInterval(setOnline, 60000); // Every 60 seconds
}

// HTTP API
http.createServer(async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  if (req.url === '/status') { res.end(JSON.stringify({ connected: botConnected })); return; }
  if (req.url === '/request-code') {
    if (botConnected) { writePairingStatus({ status: 'connected' }); res.end(JSON.stringify({ status: 'connected' })); return; }
    if (!sock) { res.end(JSON.stringify({ status: 'error', message: 'لا يوجد اتصال' })); return; }
    try {
      const code = await Promise.race([
        sock.requestPairingCode('201028900122'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000))
      ]);
      const fmt = code?.match(/.{1,4}/g)?.join('-') || code;
      console.log('🔑 Code:', fmt);
      const result = { status: 'pairing', code: fmt, rawCode: code, phone: '201028900122', steps: ['افتح واتساب في الموبايل', 'روح الإعدادات → الأجهزة المرتبطة → ربط جهاز', 'اختار "ربط برقم الهاتف"', `ادخل الكود: ${fmt}`] };
      writePairingStatus(result);
      res.end(JSON.stringify(result));
    } catch (e) {
      console.error('Code error:', e.message);
      res.end(JSON.stringify({ status: 'error', message: e.message }));
    }
    return;
  }
  res.end(JSON.stringify({ status: 'ok' }));
}).listen(8787, '0.0.0.0', () => { console.log('🌐 API on :8787'); startWA(); });

async function startWA() {
  const { version } = await fetchLatestBaileysVersion();
  const authPath = path.join(__dirname, 'auth_info');
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  
  sock = makeWASocket({ 
    version, 
    auth: state, 
    printQRInTerminal: false, 
    browser: ['OptiSize Bot', 'Chrome', '1.0'],
    markOnlineOnConnect: true,  // Auto-mark as online on connect
  });
  
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', async (u) => {
    if (u.qr) { botConnected = false; writePairingStatus({ status: 'ready' }); console.log('📱 Ready for QR'); }
    if (u.connection === 'close') { 
      botConnected = false; 
      if (presenceInterval) { clearInterval(presenceInterval); presenceInterval = null; }
      const r = u.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut; 
      if (r) { 
        console.log('🔄 Reconnecting...'); 
        setTimeout(startWA, 3000); 
      } else { 
        writePairingStatus({ status: 'logged_out' }); 
        console.log('🔴 Logged out permanently'); 
      } 
    }
    if (u.connection === 'open') { 
      botConnected = true; 
      console.log('✅ Connected!'); 
      writePairingStatus({ status: 'connected' });
      
      // Set bot as online/available
      startPresenceKeepAlive();
    }
  });
  
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]; 
    if (!m.message || m.key.fromMe) return;
    
    const from = m.key.remoteJid, phone = from.replace('@s.whatsapp.net', '');
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || '';
    
    // Mark message as read (blue ticks ✓✓)
    try {
      await sock.readMessages([m.key]);
      console.log(`✓✓ Read message from ${phone}`);
    } catch (e) {
      console.error('Failed to mark as read:', e.message);
    }
    
    // Show "typing..." indicator
    try {
      await sock.sendPresenceUpdate('composing', from);
    } catch {}
    
    console.log(`📩 ${phone}: ${text || '[IMG]'}`);
    
    // Small delay to show typing effect
    await new Promise(r => setTimeout(r, 500));
    
    if (ownerChatActive[phone]) { 
      if (text === 'انتهى') { 
        ownerChatActive[phone] = false; 
        await sock.sendMessage(from, { text: 'شكراً! 🙏' }); 
      } 
      return; 
    }
    
    if (m.message?.imageMessage) { 
      if (userStates[phone] === 'awaiting_receipt') await handleReceipt(from, phone, m); 
      else await sock.sendMessage(from, { text: WELCOME }); 
      return; 
    }
    
    const i = text.trim();
    if (i === '1' || i === 'اشتراك' || i === 'اشترك') { 
      userStates[phone] = 'awaiting_receipt'; 
      await sock.sendMessage(from, { text: SUB_INFO }); 
      await new Promise(r=>setTimeout(r,1000)); 
      await sock.sendMessage(from, { text: PAY_CONFIRM }); 
    }
    else if (i === '2' || i === 'تحدث') { 
      ownerChatActive[phone] = true; 
      await sock.sendMessage(from, { text: '👤 تم تحويلك لفريق الدعم.\nلإنهاء المحادثة أرسل: انتهى' }); 
    }
    else await sock.sendMessage(from, { text: WELCOME });
    
    // Set back to available after responding
    try { await sock.sendPresenceUpdate('available'); } catch {}
  });
}

async function handleReceipt(from, phone, msg) {
  await sock.sendMessage(from, { text: '⏳ جاري المراجعة...' });
  try {
    const buf = await sock.downloadMediaMessage(msg);
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();
    const b64 = buf.toString('base64');
    const r = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [{ type: 'text', text: `تحقق من إيصال الدفع:\n1. الرقم 01028900122؟ (نعم/لا)\n2. المبلغ 50 جنيه؟ (نعم/لا)\n3. تاريخ/وقت؟ (نعم/لا)\n4. تم الدفع؟ (نعم/لا)\n5. النتيجة: مقبول/مرفوض\nبالعربية باختصار.` }, { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } }] }], thinking: { type: 'disabled' } });
    const a = r.choices[0]?.message?.content || '';
    if (a.includes('مقبول') && !a.includes('مرفوض')) {
      const code = generateCode(phone); await saveSubscriptionToDB(code, phone); userStates[phone] = 'idle';
      await sock.sendMessage(from, { text: `✅ تم التأكيد!\n\n🔑 الكود: ${code}\n\nأدخله في OptiSize في مركز صحة العين\n⏰ صالح شهر\nشكراً! 🙏` });
    } else { await sock.sendMessage(from, { text: '❌ غير مقبول. حاول تاني بصورة أوضح.' }); }
  } catch (e) { console.error(e); await sock.sendMessage(from, { text: '⚠️ خطأ. حاول تاني.' }); }
}

console.log('🚀 OptiSize Bot starting...');
