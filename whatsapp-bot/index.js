const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Database path - shared with OptiSize app
const DB_PATH = path.join(__dirname, '..', 'db', 'custom.db');

// Subscription codes storage
const CODES_FILE = path.join(__dirname, 'subscription_codes.json');

// Files for communication with Next.js app
const PAIRING_FILE = path.join(__dirname, '..', 'public', 'pairing.json');
const SIGNAL_FILE = path.join(__dirname, '..', 'public', 'pairing-signal.json');

// Bot state
let userStates = {};
let ownerChatActive = {};
let botConnected = false;
let sock = null;
let currentQR = null;

// Write pairing status to file
function writePairingStatus(data) {
  fs.writeFileSync(PAIRING_FILE, JSON.stringify(data));
}

// Load existing codes
function loadCodes() {
  try {
    if (fs.existsSync(CODES_FILE)) {
      return JSON.parse(fs.readFileSync(CODES_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

function saveCodes(codes) {
  fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
}

// Generate unique code: 3 letters + 5 digits linked to phone
function generateCode(phone) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const last4 = phone.replace(/\D/g, '').slice(-4);
  let code;
  const codes = loadCodes();
  do {
    const l1 = letters[Math.floor(Math.random() * letters.length)];
    const l2 = letters[Math.floor(Math.random() * letters.length)];
    const l3 = letters[Math.floor(Math.random() * letters.length)];
    code = `${l1}${l2}${l3}${last4}${Math.floor(Math.random() * 10)}`;
  } while (codes[code]);
  return code;
}

// Save subscription code to database
async function saveSubscriptionToDB(code, phone) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    await prisma.subscription.create({
      data: { code, phone, isActive: false },
    });
    console.log(`✅ Code ${code} saved to database for phone ${phone}`);
  } catch (error) {
    console.error('❌ Error saving to database:', error.message);
    const codes = loadCodes();
    codes[code] = { phone, createdAt: new Date().toISOString(), activated: false };
    saveCodes(codes);
  } finally {
    await prisma.$disconnect();
  }
}

// Request fresh pairing code on demand
async function requestFreshPairingCode() {
  if (!sock) {
    writePairingStatus({ status: 'not_started', message: 'البوت مش شغال' });
    return;
  }
  
  if (botConnected) {
    writePairingStatus({ status: 'connected' });
    return;
  }

  try {
    const code = await sock.requestPairingCode('201028900122');
    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
    
    console.log(`\n🔑 Fresh pairing code: ${formattedCode}\n`);
    
    writePairingStatus({
      status: 'pairing',
      code: formattedCode,
      rawCode: code,
      phone: '201028900122',
      steps: [
        'افتح واتساب في الموبايل',
        'روح الإعدادات → الأجهزة المرتبطة → ربط جهاز',
        'اختار "ربط برقم الهاتف"',
        `ادخل الكود: ${formattedCode}`
      ]
    });
  } catch (err) {
    console.error('❌ Error requesting pairing code:', err.message);
    
    // If pairing code fails, try QR
    if (currentQR) {
      try {
        const qrPath = path.join(__dirname, '..', 'public', 'whatsapp-qr.png');
        await QRCode.toFile(qrPath, currentQR, { width: 300, margin: 2 });
        writePairingStatus({
          status: 'qr',
          message: 'امسح الـ QR من واتساب',
          qrImage: '/whatsapp-qr.png'
        });
      } catch {}
    } else {
      writePairingStatus({ status: 'error', message: 'مفيش كود متاح - حاول تاني' });
    }
  }
}

// Watch for signal file (from Next.js app)
function watchForSignal() {
  try {
    if (fs.existsSync(SIGNAL_FILE)) {
      const signal = JSON.parse(fs.readFileSync(SIGNAL_FILE, 'utf-8'));
      if (signal.action === 'request_code') {
        fs.unlinkSync(SIGNAL_FILE);
        requestFreshPairingCode();
      }
    }
  } catch {}
}

// Poll for signal every 2 seconds
setInterval(watchForSignal, 2000);

// Welcome message
const WELCOME_MESSAGE = `مرحباً بك في OptiSize! 👁️

كيف يمكنني مساعدتك؟

1️⃣ اشتراك - اشترك في مركز صحة العين VIP
2️⃣ تحدث - تحدث مع فريق الدعم

أرسل الرقم أو الكلمة 👇`;

const SUBSCRIPTION_INFO = `💎 اشتراك مركز صحة العين VIP

قيمة الاشتراك: 50 جنيه شهرياً

💰 طريقة الدفع:
حول 50 جنيه على رقم فودافون كاش:
📱 01028900122

بعد الدفع أرسل صورة تأكيد الدفع هنا ✅`;

const PAYMENT_CONFIRM = `📸 أرسل صورة تأكيد الدفع الآن

ملاحظة: تأكد أن الصورة توضح:
- الرقم المحول ليه (01028900122)
- المبلغ (50 جنيه)
- تاريخ ووقت التحويل`;

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  console.log(`📦 Using Baileys version: ${version}`);

  const authPath = path.join(__dirname, 'auth_info');
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['OptiSize Bot', 'Chrome', '1.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = qr;
      botConnected = false;
      // Don't auto-request pairing code - wait for signal from app
      writePairingStatus({ 
        status: 'ready',
        message: 'البوت جاهز - اضغط "طلب كود" من التطبيق'
      });
    }

    if (connection === 'close') {
      botConnected = false;
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        writePairingStatus({ status: 'disconnected' });
        startBot();
      } else {
        writePairingStatus({ status: 'logged_out', message: 'تم تسجيل الخروج - لازم تربط تاني' });
      }
    } else if (connection === 'open') {
      botConnected = true;
      currentQR = null;
      console.log('✅ البوت متصل بنجاح!');
      writePairingStatus({ status: 'connected' });
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const phone = from.replace('@s.whatsapp.net', '');
    const text = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || '';

    console.log(`📩 Message from ${phone}: ${text || '[Image/Media]'}`);

    if (ownerChatActive[phone]) {
      if (text === 'انتهى' || text === 'انهي') {
        ownerChatActive[phone] = false;
        await sock.sendMessage(from, { text: 'شكراً لتواصلك معنا! 🙏\nلو محتاج أي حاجة تاني تواصل معانا في أي وقت.' });
      }
      return;
    }

    if (msg.message?.imageMessage) {
      const state = userStates[phone];
      if (state === 'awaiting_receipt') {
        await handleReceiptImage(sock, from, phone, msg);
      } else {
        await sock.sendMessage(from, { text: WELCOME_MESSAGE });
      }
      return;
    }

    const input = text.trim();
    
    if (input === '1' || input === 'اشتراك' || input === 'اشترك') {
      userStates[phone] = 'awaiting_payment';
      await sock.sendMessage(from, { text: SUBSCRIPTION_INFO });
      await new Promise(r => setTimeout(r, 1000));
      await sock.sendMessage(from, { text: PAYMENT_CONFIRM });
      userStates[phone] = 'awaiting_receipt';
    } else if (input === '2' || input === 'تحدث' || input === 'محادثة') {
      ownerChatActive[phone] = true;
      await sock.sendMessage(from, { text: '👤 تم تحويلك لفريق الدعم.\nاكتب رسالتك وسيرد عليك أحد الفريق.\n\nلإنهاء المحادثة أرسل: انتهى' });
    } else {
      await sock.sendMessage(from, { text: WELCOME_MESSAGE });
    }
  });

  return sock;
}

async function handleReceiptImage(sock, from, phone, msg) {
  await sock.sendMessage(from, { text: '⏳ جاري مراجعة صورة الدفع...' });

  try {
    const buffer = await sock.downloadMediaMessage(msg);
    const tempPath = path.join(__dirname, 'temp_receipts', `${phone}_${Date.now()}.jpg`);
    fs.mkdirSync(path.dirname(tempPath), { recursive: true });
    fs.writeFileSync(tempPath, buffer);

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();
    
    const imageBase64 = buffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

    const response = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `أنت مساعد للتحقق من إيصالات الدفع. تحقق من هذه الصورة وأجب بالتنسيق التالي فقط:

1. هل يوجد رقم موبايل محول ليه؟ وهل هو 01028900122؟ (نعم/لا)
2. هل يوجد مبلغ محول؟ وهل هو 50 جنيه أو قريب منه؟ (نعم/لا)
3. هل يوجد تاريخ ووقت التحويل؟ (نعم/لا)
4. هل يوجد كلام يدل على تم الدفع أو التحويل؟ (نعم/لا)
5. النتيجة النهائية: مقبول / مرفوض

أجب بالعربية باختصار.` },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }],
      thinking: { type: 'disabled' }
    });

    const analysis = response.choices[0]?.message?.content || '';
    console.log(`🔍 Receipt analysis for ${phone}:`, analysis);
    const isApproved = analysis.includes('مقبول') && !analysis.includes('مرفوض');
    try { fs.unlinkSync(tempPath); } catch {}

    if (isApproved) {
      const code = generateCode(phone);
      await saveSubscriptionToDB(code, phone);
      userStates[phone] = 'idle';
      await sock.sendMessage(from, { 
        text: `✅ تم تأكيد الدفع بنجاح!

🔑 كود التفعيل الخاص بك:
${code}

📋 أدخل الكود ده في تطبيق OptiSize في صفحة مركز صحة العين عشان تفعّل اشتراكك VIP

⏰ الاشتراك صالح لمدة شهر من التاريخ ده

شكراً لثقتك فينا! 🙏` 
      });
    } else {
      await sock.sendMessage(from, { 
        text: `❌ لم يتم تأكيد الدفع

الصورة مش واضحة أو فيها مشكلة. ممكن السبب:
- الرقم المحول ليه مش 01028900122
- المبلغ مش 50 جنيه
- الصورة مش واضحة

حاول تاني وابعت صورة أوضح ✅` 
      });
    }
  } catch (error) {
    console.error('Receipt processing error:', error);
    await sock.sendMessage(from, { text: '⚠️ حصل خطأ أثناء مراجعة الصورة. حاول تاني لو سمحت.' });
  }
}

// Start
writePairingStatus({ status: 'starting' });
console.log('🚀 Starting OptiSize WhatsApp Bot...');
startBot().catch(console.error);
