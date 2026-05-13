import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import http from 'http'

const GROQ_KEY = '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'
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const PAY_NUM = '01028900122'
const MY_NUM = '201028900122'
const APP_URL = 'https://optisize.vercel.app'
const BOT_SECRET = 'optisize-bot-secret-2026'

http.createServer((req, res) => { res.writeHead(200); res.end('Bot is running') }).listen(8080)

async function checkReceipt(b64) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + GROQ_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: [
        { type: 'text', text: 'هل هذا إيصال دفع حقيقي بمبلغ 50 جنيه مصري للرقم ' + PAY_NUM + '؟ افحص: 1) تطبيق الدفع 2) المبلغ 3) الرقم 4) التاريخ 5) علامات تزوير. أجب: مقبول أو مرفوض مع السبب' },
        { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } }
      ]}],
      max_tokens: 300
    })
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'خطأ في التحليل'
}

async function generateCode(phone) {
  try {
    const res = await fetch(APP_URL + '/api/subscriptions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: BOT_SECRET, phone, months: 1 })
    })
    const data = await res.json()
    if (data.success) return data.code
    return null
  } catch (e) {
    console.error('Failed to generate code:', e)
    return null
  }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ auth: state, printQRInTerminal: false, logger: pino({ level: 'silent' }) })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async (up) => {
    if (up.qr) { const code = await sock.requestPairingCode(MY_NUM); console.log('كود الربط:', code) }
    if (up.connection === 'close') {
      const err = up.lastDisconnect?.error
      const status = err?.output?.statusCode || err?.data?.status
      if (status === 405) { console.log('الرقم محظور - استنى 24-48 ساعة'); return }
      if (status !== DisconnectReason.loggedOut) { console.log('بإعيد الاتصال...'); start() }
    }
    if (up.connection === 'open') console.log('البوت اشتغل بنجاح!')
  })
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (msg.message === undefined || msg.message === null || msg.key.fromMe) return
    const from = msg.key.remoteJid
    const phone = from.replace('@s.whatsapp.net', '')
    const img = msg.message.imageMessage
    if (img === undefined) {
      await sock.sendMessage(from, { text: 'مرحبا! ابعت صورة إيصال الدفع (50 جنيه للرقم ' + PAY_NUM + ') عشان تحصل على كود التفعيل' })
      return
    }
    await sock.sendMessage(from, { text: 'جاري التحقق من الإيصال...' })
    try {
      const buf = await sock.downloadMediaMessage(msg)
      const b64 = buf.toString('base64')
      const result = await checkReceipt(b64)
      if (result.includes('مقبول')) {
        const code = await generateCode(phone)
        if (code) {
          await sock.sendMessage(from, { text: 'تم التحقق بنجاح! كود التفعيل الخاص بك:\n\n' + code + '\n\nافتح تطبيق OptiSize ← مركز صحة العين ← ادخل الكود\nالكود صالح لمدة شهر واحد' })
        } else {
          await sock.sendMessage(from, { text: 'تم التحقق بنجاح! لكن حصل خطأ في إنشاء الكود. حاول تاني بعد شوية' })
        }
      } else {
        await sock.sendMessage(from, { text: 'الإيصال مرفوض:\n' + result + '\n\nلو بتعتقد فيه خطأ، ابعت الإيصال تاني' })
      }
    } catch (e) { console.error('Error:', e); await sock.sendMessage(from, { text: 'حصل خطأ، حاول تاني' }) }
  })
}
start()
