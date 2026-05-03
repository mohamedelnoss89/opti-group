const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Database path - shared with OptiSize app
const DB_PATH = path.join(__dirname, '..', 'db', 'custom.db');

// Subscription codes storage (JSON file for simplicity, synced with SQLite)
const CODES_FILE = path.join(__dirname, 'subscription_codes.json');

// Bot state
let userStates = {}; // phone -> state: 'idle' | 'awaiting_payment' | 'awaiting_receipt'
let ownerChatActive = {}; // phone -> boolean (when owner takes over)

// QR code server state
let latestQRData = null; // latest QR string for web page
let qrImagePath = path.join(__dirname, 'qr_code.png');

// Start a simple HTTP server to show QR in browser
const QR_PORT = 8787;
const qrServer = http.createServer((req, res) => {
  if (latestQRData) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html dir="rtl">
<head><title>OptiSize WhatsApp QR</title>
<style>
  body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a1a;font-family:Arial,sans-serif;color:#fff}
  h1{color:#00e5ff;margin-bottom:10px}
  p{color:#aaa;margin-top:10px;font-size:18px}
  img{border-radius:16px;box-shadow:0 0 40px rgba(0,229,255,.3)}
  .hint{color:#666;font-size:14px;margin-top:20px}
</style></head>
<body>
  <h1>📱 امسح الـ QR من واتساب</h1>
  <img src="data:image/png;base64,${fs.readFileSync(qrImagePath).toString('base64')}" width="300" height="300"/>
  <p>افتح واتساب → الإعدادات → الأجهزة المرتبطة → ربط جهاز</p>
  <div class="hint">هذه الصفحة تتحدث تلقائياً عند ظهور QR جديد</div>
  <script>setTimeout(()=>location.reload(),5000)</script>
</body>
</html>`);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html dir="rtl">
<head><title>OptiSize WhatsApp QR</title>
<style>
  body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a1a;font-family:Arial,sans-serif;color:#fff}
  h2{color:#00e5ff}
  p{color:#aaa}
</style></head>
<body>
  <h2>⏳ في انتظار الـ QR كود...</h2>
  <p>الصفحة هتتحدث تلقائياً</p>
  <script>setTimeout(()=>location.reload(),3000)</script>
</body>
</html>`);
  }
});
qrServer.listen(QR_PORT, () => {
  console.log(`🌐 افتح البراوزر على: http://localhost:${QR_PORT}`);
});

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
      data: {
        code: code,
        phone: phone,
        isActive: false,
      },
    });
    console.log(`✅ Code ${code} saved to database for phone ${phone}`);
  } catch (error) {
    console.error('❌ Error saving to database:', error.message);
    // Fallback: save to JSON
    const codes = loadCodes();
    codes[code] = { phone, createdAt: new Date().toISOString(), activated: false };
    saveCodes(codes);
  } finally {
    await prisma.$disconnect();
  }
}

// Welcome message
const WELCOME_MESSAGE = `مرحباً بك في OptiSize! 👁️

كيف يمكنني مساعدتك؟

1️⃣ اشتراك - اشترك في مركز صحة العين VIP
2️⃣ تحدث - تحدث مع فريق الدعم

أرسل الرقم أو الكلمة 👇`;

// Subscription info
const SUBSCRIPTION_INFO = `💎 اشتراك مركز صحة العين VIP

قيمة الاشتراك: 50 جنيه شهرياً

💰 طريقة الدفع:
حول 50 جنيه على رقم فودافون كاش:
📱 01028900122

بعد الدفع أرسل صورة تأكيد الدفع هنا ✅`;

// Payment confirmation request
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

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['OptiSize Bot', 'Chrome', '1.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      latestQRData = qr;
      
      // Save QR as PNG image
      try {
        await QRCode.toFile(qrImagePath, qr, { width: 300, margin: 2 });
        console.log('📸 QR saved as PNG → ' + qrImagePath);
      } catch (err) {
        console.error('Error saving QR image:', err.message);
      }
      
      // Show small QR in terminal
      console.log('\n📱 امسح الـ QR من واتساب:');
      qrcodeTerminal.generate(qr, { small: true });
      console.log('\n🌐 أو افتح البراوزر على: http://localhost:' + QR_PORT);
      console.log('📂 أو افتح الصورة: ' + qrImagePath + '\n');
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ البوت متصل بنجاح!');
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

    // If owner chat is active for this user, skip bot
    if (ownerChatActive[phone]) {
      // Check if owner wants to end the chat
      if (text === 'انتهى' || text === 'انهي') {
        ownerChatActive[phone] = false;
        await sock.sendMessage(from, { text: 'شكراً لتواصلك معنا! 🙏\nلو محتاج أي حاجة تاني تواصل معانا في أي وقت.' });
      }
      return; // Let the owner handle it
    }

    // Handle image messages (receipt confirmation)
    if (msg.message?.imageMessage) {
      const state = userStates[phone];
      if (state === 'awaiting_receipt') {
        await handleReceiptImage(sock, from, phone, msg);
      } else {
        await sock.sendMessage(from, { text: WELCOME_MESSAGE });
      }
      return;
    }

    // Handle text messages
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
      // Default: show welcome
      await sock.sendMessage(from, { text: WELCOME_MESSAGE });
    }
  });

  return sock;
}

async function handleReceiptImage(sock, from, phone, msg) {
  await sock.sendMessage(from, { text: '⏳ جاري مراجعة صورة الدفع...' });

  try {
    // Download the image
    const buffer = await sock.downloadMediaMessage(msg);
    
    // Save temporarily for AI analysis
    const tempPath = path.join(__dirname, 'temp_receipts', `${phone}_${Date.now()}.jpg`);
    fs.mkdirSync(path.dirname(tempPath), { recursive: true });
    fs.writeFileSync(tempPath, buffer);

    // Use VLM to analyze the receipt
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();
    
    const imageBase64 = buffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `أنت مساعد للتحقق من إيصالات الدفع. تحقق من هذه الصورة وأجب بالتنسيق التالي فقط:

1. هل يوجد رقم موبايل محول ليه؟ وهل هو 01028900122؟ (نعم/لا)
2. هل يوجد مبلغ محول؟ وهل هو 50 جنيه أو قريب منه؟ (نعم/لا)
3. هل يوجد تاريخ ووقت للتحويل؟ (نعم/لا)
4. هل يوجد كلام يدل على تم الدفع أو التحويل؟ (نعم/لا)
5. النتيجة النهائية: مقبول / مرفوض

أجب بالعربية باختصار.`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });

    const analysis = response.choices[0]?.message?.content || '';
    console.log(`🔍 Receipt analysis for ${phone}:`, analysis);

    // Check if approved
    const isApproved = analysis.includes('مقبول') && !analysis.includes('مرفوض');

    // Clean up temp file
    try { fs.unlinkSync(tempPath); } catch {}

    if (isApproved) {
      // Generate and save activation code
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
    await sock.sendMessage(from, { 
      text: '⚠️ حصل خطأ أثناء مراجعة الصورة. حاول تاني لو سمحت.' 
    });
  }
}

// Start
console.log('🚀 Starting OptiSize WhatsApp Bot...');
startBot().catch(console.error);
