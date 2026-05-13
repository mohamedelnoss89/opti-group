const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { default: pino } = require('pino')

async function checkBan() {
  console.log('جارى فحص الحظر...')
  
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    connectTimeoutMs: 20000,
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    
    if (qr) {
      console.log('\n📱 امسح الكود ده:')
      console.log('لو الرقم محظور هنجيب 405')
    }
    
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      console.log('\n=== النتيجة ===')
      if (statusCode === 405) {
        console.log('❌ الرقم لسه محظور! (405)')
      } else if (statusCode === 401) {
        console.log('🔑 الجلسة انتهت - محتاج مسح QR جديد')
      } else if (statusCode === 428) {
        console.log('⏳ محتاج مسح QR - الكود القديم انتهت صلاحيته')
      } else {
        console.log('⚠️ اتقفل بكود:', statusCode, lastDisconnect?.error?.message)
      }
      process.exit(0)
    }
    
    if (connection === 'open') {
      console.log('\n=== النتيجة ===')
      console.log('✅ الرقم مفعل! الحظر اتشال!')
      process.exit(0)
    }
  })

  sock.ev.on('creds.update', saveCreds)
  
  // Timeout after 30 seconds
  setTimeout(() => {
    console.log('\n⏰ انتهى الوقت - محتاج مسح QR')
    process.exit(0)
  }, 30000)
}

checkBan().catch(console.error)
