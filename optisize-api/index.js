import http from 'http'
import fs from 'fs'
import crypto from 'crypto'

// ============ قاعدة البيانات ============
const DATA_FILE = '/tmp/optisize-data.json'

let data = { codes: {}, customers: {}, usedHashes: [] }
try { data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) } catch(e) {}

if (!data.codes['SIZE2026']) data.codes['SIZE2026'] = { max: 3, users: [], expires: null }
if (!data.codes['OPTI2026']) data.codes['OPTI2026'] = { max: 3, users: [], expires: null }
if (!data.codes['EYES2026']) data.codes['EYES2026'] = { max: 3, users: [], expires: null }
if (!data.usedHashes) data.usedHashes = []

function save() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)) } catch(e) {}
}

// ============ إعدادات ============
const BOT_NUMBER = '201033345613'
const PAYMENT_NUMBER = '01033345613'
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

// ============ API SERVER (يشتغل الأول) ============
const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    res.end(); return
  }

  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  const url = new URL(req.url, 'http://x')

  if (url.pathname === '/verify') {
    const code = url.searchParams.get('code')
    const userId = url.searchParams.get('userId')
    if (!code || !userId) { res.end('{"valid":false,"error":"missing"}'); return }
    const c = data.codes[code.toUpperCase()]
    if (!c) { res.end('{"valid":false,"error":"كود غير صحيح"}'); return }
    if (c.users.includes(userId)) { res.end('{"valid":true,"message":"مفعل بالفعل"}'); return }
    if (c.users.length >= c.max) { res.end('{"valid":false,"error":"الكود مستخدم بالكامل"}'); return }
    c.users.push(userId)
    if (!c.expires) c.expires = new Date(Date.now() + 30*24*60*60*1000).toISOString()
    save()
    res.end('{"valid":true,"expires":"'+c.expires+'"}')
    return
  }

  if (url.pathname === '/check') {
    const userId = url.searchParams.get('userId')
    const f = Object.entries(data.codes).find(([,v]) => v.users.includes(userId))
    if (f && (!f[1].expires || new Date(f[1].expires) > new Date())) {
      res.end('{"active":true,"code":"'+f[0]+'","expires":"'+f[1].expires+'"}')
    } else { res.end('{"active":false}') }
    return
  }

  res.end('{"status":"ok","codes":'+Object.keys(data.codes).length+',"customers":'+Object.keys(data.customers).length+'}')
})

const PORT = process.env.PORT || 8080
server.listen(PORT, '0.0.0.0', () => console.log('API على ' + PORT))

// ============ منع الكراش ============
process.on('uncaughtException', (e) => console.error('Uncaught:', e?.message || e))
process.on('unhandledRejection', (e) => console.error('Unhandled:', e?.message || e))

// ============ دوال ============
function genCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'OPT-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function getImageHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

async function verifyReceipt(imageBuffer) {
  if (!GROQ_API_KEY) return { valid: false, reason: 'خطأ - مفيش مفتاح API' }

  const base64 = imageBuffer.toString('base64')
  const nowCairo = new Date(Date.now() + 2*60*60*1000).toISOString()

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + GROQ_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: `أنت خبير في التحقق من إيصالات الدفع المصرية. حلل الإيصال وتحقق:

1. phone_match: هل الرقم المحول له ينتهي بـ 033345613 أو 01033345613 أو 201033345613؟
2. amount_match: هل المبلغ 50 جنيه مصري؟
3. success: هل العملية ناجحة؟
4. time_valid: هل التاريخ لا يمر عليه أكثر من 24 ساعة؟ الآن: ${nowCairo}
5. genuine: هل الإيصال حقيقي وغير معدل؟

أجب بهذا الشكل فقط:
{"phone_match":true/false,"amount_match":true/false,"success":true/false,"time_valid":true/false,"genuine":true/false,"reason":"ok أو سبب الرفض"}` },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + base64 } }
          ]
        }],
        max_tokens: 300,
        temperature: 0.1
      })
    })

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[^}]+\}/)
    if (!jsonMatch) return { valid: false, reason: 'لم يتم تحليل الإيصال' }

    const a = JSON.parse(jsonMatch[0])
    const checks = { phone_match: a.phone_match===true, amount_match: a.amount_match===true, success: a.success===true, time_valid: a.time_valid===true, genuine: a.genuine===true }

    if (!Object.values(checks).every(v => v)) {
      const reasons = { phone_match:'الرقم غير صحيح (لازم '+PAYMENT_NUMBER+')', amount_match:'المبلغ مش 50 جنيه', success:'العملية مش ناجحة', time_valid:'الإيصال قديم (أكتر من 24 ساعة)', genuine:'الإيصال يبدو مش حقيقي' }
      return { valid: false, reason: Object.entries(checks).filter(([,v])=>!v).map(([k])=>reasons[k]).join('\n') }
    }
    return { valid: true }
  } catch(e) {
    return { valid: false, reason: 'خطأ في التحليل: ' + e.message }
  }
}

// ============ بوت الواتساب (بعد 10 ثواني) ============
setTimeout(async () => {
  try {
    // مسح بيانات الرقم القديم
    try { fs.rmSync('./auth_info', { recursive: true, force: true }) } catch(e) {}

    const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys')
    const { default: pino } = await import('pino')

    async function startBot() {
      try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

        const sock = makeWASocket({
          auth: state,
          printQRInTerminal: false,
          logger: pino({ level: 'silent' }),
          connectTimeoutMs: 20000,
        })

        sock.ev.on('creds.update', saveCreds)

        // طلب كود ربط
        if (!state.creds.registered) {
          setTimeout(async () => {
            try {
              const code = await sock.requestPairingCode(BOT_NUMBER)
              console.log('🔐 كود الربط: ' + code)
            } catch(e) {
              console.error('Pairing error:', e.message)
            }
          }, 3000)
        }

        sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect } = update
          if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode
            if (code === 405) {
              console.log('❌ محظور - هحاول بعد 5 دقايق')
              setTimeout(() => startBot(), 300000)
            } else if (code === 401) {
              console.log('🔑 محتاج ربط جديد - هحاول بعد دقيقة')
              setTimeout(() => { try { fs.rmSync('./auth_info', {recursive:true, force:true}) } catch(e){} startBot() }, 60000)
            } else if (code === 428) {
              console.log('⏳ كود الربط انتهى - هيظهر جديد')
              setTimeout(() => startBot(), 5000)
            } else {
              console.log('⚠️ اتفصل بكود:', code, '- هحاول بعد 30 ثانية')
              setTimeout(() => startBot(), 30000)
            }
          } else if (connection === 'open') {
            console.log('✅ البوت اتصل بالواتساب!')
          }
        })

        sock.ev.on('messages.upsert', async ({ messages }) => {
          try {
            const msg = messages[0]
            if (!msg?.message || msg.key.fromMe) return
            const from = msg.key.remoteJid
            if (!from || from === 'status@broadcast') return
            const senderNumber = from.replace('@s.whatsapp.net', '')

            const imageMsg = msg.message.imageMessage
            if (imageMsg) {
              try {
                const buffer = await sock.downloadMediaMessage(msg)
                const imageHash = getImageHash(buffer)

                if (data.usedHashes.includes(imageHash)) {
                  await sock.sendMessage(from, { text: '❌ الإيصال ده اتبعت قبل كده!\nكل إيصال بيتسخدم مرة واحدة فقط.' })
                  return
                }

                await sock.sendMessage(from, { text: '⏳ جارى التحقق من الإيصال...' })
                const result = await verifyReceipt(buffer)

                if (result.valid) {
                  const code = genCode()
                  data.codes[code] = { max: 1, users: [], expires: new Date(Date.now() + 30*24*60*60*1000).toISOString() }
                  data.usedHashes.push(imageHash)
                  data.customers[senderNumber] = { code, activatedAt: new Date().toISOString(), phone: senderNumber }
                  save()
                  await sock.sendMessage(from, { text: `✅ تم التحقق بنجاح!\n\n🔑 كود التفعيل: ${code}\n📅 صالح لمدة 30 يوم\n\nاستخدم الكود في تطبيق OptiSize` })
                } else {
                  await sock.sendMessage(from, { text: `❌ الإيصال مرفوض!\n\n${result.reason}\n\n✅ الشروط:\n• التحويل لرقم ${PAYMENT_NUMBER}\n• المبلغ: 50 جنيه\n• العملية ناجحة\n• الإيصال حديث (< 24 ساعة)\n• الإيصال حقيقي` })
                }
              } catch(e) {
                console.error('Receipt err:', e.message)
                await sock.sendMessage(from, { text: '❌ حصل خطأ، حاول تاني' })
              }
            }

            const textMsg = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
            const text = textMsg.trim().toLowerCase()

            if (text === 'حالتي' || text === 'status' || text === 'حالتى') {
              const customer = data.customers[senderNumber]
              if (customer && data.codes[customer.code]) {
                const cd = data.codes[customer.code]
                const active = !cd.expires || new Date(cd.expires) > new Date()
                const days = cd.expires ? Math.max(0, Math.ceil((new Date(cd.expires) - new Date()) / 86400000)) : '∞'
                await sock.sendMessage(from, { text: active ? `✅ اشتراكك نشط\n\n🔑 الكود: ${customer.code}\n📅 باقي: ${days} يوم` : `❌ الاشتراك انتهى\n\nابعت إيصال جديد` })
              } else {
                await sock.sendMessage(from, { text: `❌ مش مشترك\n\n📍 حوّل 50 جنيه لرقم ${PAYMENT_NUMBER}\n📸 ابعت صورة الإيصال` })
              }
            }

            if (text === 'مساعدة' || text === 'help' || text === 'اوامر') {
              await sock.sendMessage(from, { text: `🤖 بوت OptiSize\n\n📍 حوّل 50 جنيه لرقم ${PAYMENT_NUMBER}\n📸 ابعت صورة الإيصال\n🔑 هيجيلك كود التفعيل\n\nالأوامر:\n• حالتي - حالة الاشتراك\n• مساعدة - الرسالة دي` })
            }

            if (text === 'hi' || text === 'hello' || text === 'اهلا' || text === 'مرحبا' || text === 'هاي') {
              await sock.sendMessage(from, { text: `أهلاً! 🎉\n\nأنا بوت OptiSize\n\n1️⃣ حوّل 50 جنيه لرقم ${PAYMENT_NUMBER}\n2️⃣ ابعت صورة الإيصال هنا\n3️⃣ هيجيلك كود التفعيل` })
            }
          } catch(e) {
            console.error('Msg err:', e.message)
          }
        })
      } catch(e) {
        console.error('startBot err:', e.message)
        setTimeout(() => startBot(), 60000)
      }
    }

    startBot()
  } catch(e) {
    console.error('Bot init err:', e.message)
  }
}, 10000)
