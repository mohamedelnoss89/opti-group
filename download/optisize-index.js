import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

const OWNER_NUMBER = '201028900122';
const PAYMENT_NUMBER = '01028900122';
const SUBSCRIPTION_PRICE = 50;
const GROQ_API_KEY = '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';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const USED_RECEIPTS_FILE = './used_receipts.json';

function loadUsedReceipts() {
    try {
        if (fs.existsSync(USED_RECEIPTS_FILE)) return JSON.parse(fs.readFileSync(USED_RECEIPTS_FILE, 'utf-8'));
    } catch (e) {}
    return [];
}

function saveUsedReceipts(r) {
    try { fs.writeFileSync(USED_RECEIPTS_FILE, JSON.stringify(r, null, 2)); } catch (e) {}
}

function isReceiptUsed(n) { return loadUsedReceipts().includes(n); }
function markReceiptUsed(n) { const r = loadUsedReceipts(); r.push(n); saveUsedReceipts(r); }

const APP_PROFILES = {
    'Vodafone Cash': { keywords: ['فودافون كاش', 'vodafone cash'] },
    'InstaPay': { keywords: ['instapay', 'انستاباي'] },
    'NBE': { keywords: ['nbe', 'البنك الأهلي'] },
    'CIB': { keywords: ['cib', 'البنك التجاري الدولي'] },
    'Fawry': { keywords: ['fawry', 'فوري'] },
    'Etisalat Cash': { keywords: ['اتصالات كاش', 'etisalat cash'] },
    'Orange Cash': { keywords: ['اورانج كاش', 'orange cash'] },
    'We Pay': { keywords: ['we pay', 'وي باي'] },
    'BM Wallet': { keywords: ['bm wallet', 'بنك مصر'] },
    'AlexBank': { keywords: ['alex bank', 'بنك الإسكندرية'] }
};

async function callGroq(messages) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + GROQ_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: GROQ_MODEL, messages, max_tokens: 1000, temperature: 0.1 })
    });
    const d = await res.json();
    const c = d.choices?.[0]?.message?.content || '';
    try { const m = c.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (e) {}
    return null;
}

async function extractReceiptData(buf, mime) {
    const b64 = buf.toString('base64');
    return await callGroq([{ role: 'user', content: [
        { type: 'text', text: 'حلل إيصال الدفع ده واستخرج JSON فقط: {"TYPE":"نوع العملية","KEYWORD":"إرسال أو استلام أو تحويل","APP_NAME":"اسم التطبيق","SENDER_NUMBER":"رقم المرسل","RECEIVER_NUMBER":"رقم المستلم","AMOUNT":"المبلغ رقم فقط","DATE":"التاريخ","TIME":"الوقت","RECEIPT_NUMBER":"رقم الإيصال","HAS_WATERMARK":false,"EDITING_SIGNS":"علامات أو غير محدد"} كن دقيق جدا في الأرقام.' },
        { type: 'image_url', image_url: { url: 'data:' + mime + ';base64,' + b64 } }
    ]}]);
}

async function fraudCheck(data, buf, mime) {
    const b64 = buf.toString('base64');
    return await callGroq([{ role: 'user', content: [
        { type: 'text', text: 'خبير كشف إيصالات مزيفة. بيانات: ' + JSON.stringify(data) + '. المطلوب: ' + SUBSCRIPTION_PRICE + ' جنيه للمستلم ' + PAYMENT_NUMBER + '. حلل الصورة وأجب JSON فقط: {"REAL_APP":true,"COLORS_MATCH_APP":true,"FAKE_SIGNS":[],"EDITING_DETECTED":false,"HAS_PHOTO_EDIT_WATERMARK":false,"GENUINE_SCORE":"0-100","VERDICT":"حقيقي أو مزيف أو مشبوه","REASON":"السبب"}. صارم: أي تعديل=مزيف، علامة مائية تعديل=مزيف.' },
        { type: 'image_url', image_url: { url: 'data:' + mime + ';base64,' + b64 } }
    ]}]);
}

function programmaticVerify(ext, frd) {
    let score = 0, max = 0, reasons = [], hardFail = false;

    max += 20;
    if (ext?.AMOUNT) {
        const amt = parseFloat(String(ext.AMOUNT).replace(/[^\d.]/g, ''));
        if (amt === SUBSCRIPTION_PRICE) score += 20;
        else reasons.push('المبلغ ' + amt + ' مش ' + SUBSCRIPTION_PRICE);
    } else reasons.push('مفيش مبلغ');

    max += 20;
    const rNum = (ext?.RECEIVER_NUMBER || '').replace(/\D/g, '');
    const pNum = PAYMENT_NUMBER.replace(/\D/g, '');
    const oNum = OWNER_NUMBER.replace(/\D/g, '');
    if (rNum && (rNum.includes(pNum) || rNum.includes(oNum) || pNum.includes(rNum) || oNum.includes(rNum))) score += 20;
    else reasons.push('رقم المستلم مش ' + PAYMENT_NUMBER);

    max += 10;
    const kw = (ext?.KEYWORD || '').toLowerCase();
    const tp = (ext?.TYPE || '').toLowerCase();
    if (kw.includes('\u0625\u0631\u0633\u0627\u0644') || kw.includes('\u062a\u062d\u0648\u064a\u0644') || kw.includes('\u062f\u0641\u0639') || tp.includes('\u062a\u062d\u0648\u064a\u0644') || tp.includes('\u062f\u0641\u0639')) score += 10;
    else reasons.push('\u0645\u0634 \u0639\u0645\u0644\u064a\u0629 \u0625\u0631\u0633\u0627\u0644');

    max += 10;
    const app = ext?.APP_NAME || '';
    let known = false;
    for (const p of Object.values(APP_PROFILES)) { for (const k of p.keywords) { if (app.toLowerCase().includes(k.toLowerCase())) { known = true; break; } } if (known) break; }
    if (known) score += 10; else reasons.push('\u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0645\u0634 \u0645\u0639\u0631\u0648\u0641: ' + app);

    max += 10;
    if (ext?.RECEIPT_NUMBER && ext.RECEIPT_NUMBER !== '\u063a\u064a\u0631 \u0645\u062d\u062f\u062f') {
        if (isReceiptUsed(ext.RECEIPT_NUMBER)) { reasons.push('\u0627\u0644\u0625\u064a\u0635\u0627\u0644 \u0627\u062a\u0639\u0645\u0644 \u0645\u0646\u0647 \u0642\u0628\u0644 \u0643\u062f\u0647!'); hardFail = true; }
        else score += 10;
    } else reasons.push('\u0645\u0641\u064a\u0634 \u0631\u0642\u0645 \u0625\u064a\u0635\u0627\u0644');

    max += 10;
    if (frd?.COLORS_MATCH_APP === true) score += 10;
    else if (frd?.COLORS_MATCH_APP === false) reasons.push('\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0645\u0634 \u0645\u062a\u0637\u0627\u0628\u0642\u0629');

    max += 10;
    if (frd?.EDITING_DETECTED === true || frd?.HAS_PHOTO_EDIT_WATERMARK === true) { reasons.push('\u0641\u064a\u0647 \u062a\u0639\u062f\u064a\u0644 \u0639\u0644\u0649 \u0627\u0644\u0635\u0648\u0631\u0629!'); hardFail = true; }
    else if (frd?.EDITING_DETECTED === false) score += 10;

    max += 5;
    if (frd?.FAKE_SIGNS?.length > 0) { reasons.push('\u0639\u0644\u0627\u0645\u0627\u062a \u062a\u0632\u0648\u064a\u0631: ' + frd.FAKE_SIGNS.join(', ')); hardFail = true; }
    else score += 5;

    max += 5;
    const gs = parseInt(frd?.GENUINE_SCORE) || 0;
    if (gs >= 80) score += 5;
    else if (gs >= 60) { score += 2; reasons.push('\u0623\u0635\u0627\u0644\u0629 \u0645\u062a\u0648\u0633\u0637\u0629: ' + gs + '%'); }
    else if (gs > 0) { reasons.push('\u0623\u0635\u0627\u0644\u0629 \u0636\u0639\u064a\u0641\u0629: ' + gs + '%'); hardFail = true; }

    if (frd?.VERDICT === '\u0645\u0632\u064a\u0641') { hardFail = true; reasons.push('\u062d\u0643\u0645 AI: \u0645\u0632\u064a\u0641'); }
    else if (frd?.VERDICT === '\u0645\u0634\u0628\u0648\u0647') reasons.push('\u062d\u0643\u0645 AI: \u0645\u0634\u0628\u0648\u0647');

    const pct = max > 0 ? (score / max) * 100 : 0;
    return { score, max, percentage: pct, reasons, accepted: !hardFail && pct >= 70 && reasons.length === 0, hardFail };
}

async function verifyReceipt(buf, mime, jid) {
    try {
        console.log('تحقق...');
        const ext = await extractReceiptData(buf, mime);
        if (!ext) return { accepted: false, reason: 'مش عارف أقرأ الإيصال' };
        console.log('مستخرج:', JSON.stringify(ext));

        const frd = await fraudCheck(ext, buf, mime);
        if (!frd) return { accepted: false, reason: 'فحص الاحتيال فشل' };
        console.log('احتيال:', JSON.stringify(frd));

        const prog = programmaticVerify(ext, frd);
        console.log('برمجي:', JSON.stringify(prog));

        if (prog.accepted) {
            if (ext.RECEIPT_NUMBER && ext.RECEIPT_NUMBER !== 'غير محدد') markReceiptUsed(ext.RECEIPT_NUMBER);
            return { accepted: true, amount: ext.AMOUNT, app: ext.APP_NAME, receiptNumber: ext.RECEIPT_NUMBER, score: prog.percentage };
        } else {
            return { accepted: false, reason: prog.reasons.length > 0 ? prog.reasons.join('\n') : 'إيصال مزيف', score: prog.percentage };
        }
    } catch (e) { console.log('Error:', e); return { accepted: false, reason: 'خطأ في التحقق' }; }
}

let pairingRequested = false;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({ version, auth: state, logger: pino({ level: 'silent' }) });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !pairingRequested && !state.creds.registered) {
            pairingRequested = true;
            try {
                const code = await sock.requestPairingCode(OWNER_NUMBER);
                console.log('\n========================================');
                console.log('رمز الاقتران: ' + code);
                console.log('واتساب > الأجهزة المرتبطة > ربط جهاز');
                console.log('========================================\n');
            } catch (e) {
                console.log('خطأ في رمز الاقتران:', e.message);
            }
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            console.log('اتصال مقفول:', code);
            if (code === 405) {
                console.log('واتساب حظر الاتصال. استنى 24-48 ساعة وجرب تاني.');
            } else if (code !== DisconnectReason.loggedOut) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('البوت متصل بنجاح!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const jid = msg.key.remoteJid;
        const num = jid.split('@')[0];

        if (msg.message.imageMessage) {
            const mime = msg.message.imageMessage.mimetype || 'image/jpeg';
            try {
                const buf = await sock.downloadMediaMessage(msg);
                const res = await verifyReceipt(buf, mime, jid);
                if (res.accepted) {
                    await sock.sendMessage(jid, { text: 'تم قبول إيصالك!\nالمبلغ: ' + res.amount + ' جنيه\nالتطبيق: ' + res.app + '\nدرجة الثقة: ' + res.score.toFixed(0) + '%\n\nمرحبا بك في OptiSize VIP!' });
                    await sock.sendMessage(OWNER_NUMBER + '@s.whatsapp.net', { text: 'إيصال مقبول\nمن: ' + num + '\nالمبلغ: ' + res.amount + '\nالتطبيق: ' + res.app });
                } else {
                    await sock.sendMessage(jid, { text: 'تم رفض الإيصال\n\nالسبب:\n' + res.reason + '\n\nابعت إيصال حقيقي ' + SUBSCRIPTION_PRICE + ' جنيه للرقم ' + PAYMENT_NUMBER });
                    await sock.sendMessage(OWNER_NUMBER + '@s.whatsapp.net', { text: 'إيصال مرفوض\nمن: ' + num + '\nالسبب:\n' + res.reason });
                }
            } catch (e) { console.log('Error:', e); await sock.sendMessage(jid, { text: 'حصل خطأ، حاول تاني' }); }
        } else if (msg.message.conversation || msg.message.extendedTextMessage) {
            const txt = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
            if (txt === 'اشتراك' || txt === 'اشترك' || txt === 'كيف أشترك؟') {
                await sock.sendMessage(jid, { text: 'للاشتراك في OptiSize VIP:\n1. حوّل ' + SUBSCRIPTION_PRICE + ' جنيه على ' + PAYMENT_NUMBER + '\n2. ابعتلي صورة الإيصال\n3. هنتحقق ويفعلك الاشتراك!' });
            }
        }
    });

    return sock;
}

console.log('جاري تشغيل OptiSize Bot...');
startBot();
