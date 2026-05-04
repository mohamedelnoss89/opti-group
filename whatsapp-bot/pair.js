#!/usr/bin/env node
/**
 * Standalone pairing code generator for OptiSize WhatsApp Bot
 * Usage: node pair.js [--fresh]
 * --fresh: Delete auth_info first to force a completely fresh pairing
 * 
 * This script:
 * 1. Optionally clears auth_info for a fresh start
 * 2. Connects to WhatsApp via Baileys
 * 3. Auto-generates a pairing code
 * 4. Writes it to ../public/pairing.json
 * 5. Stays running to accept the pairing
 * 6. Once connected, writes status to pairing.json
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const PAIRING_FILE = path.join(__dirname, '..', 'public', 'pairing.json');
const AUTH_DIR = path.join(__dirname, 'auth_info');
const PHONE = '201028900122';

let sock = null;
let paired = false;

function writePairingStatus(data) {
  try {
    fs.writeFileSync(PAIRING_FILE, JSON.stringify(data, null, 2));
    console.log('📝 Wrote pairing status:', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write pairing status:', e.message);
  }
}

// Clear auth_info if --fresh flag
const args = process.argv.slice(2);
if (args.includes('--fresh')) {
  console.log('🗑️ Deleting auth_info for fresh start...');
  try {
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      console.log('✅ auth_info deleted');
    }
  } catch (e) {
    console.error('Failed to delete auth_info:', e.message);
  }
}

// Write initial status
writePairingStatus({ status: 'starting', message: 'جاري تشغيل البوت...' });

async function startPairing() {
  try {
    console.log('🔄 Fetching latest Baileys version...');
    const { version } = await fetchLatestBaileysVersion();
    console.log(`📦 Baileys version: ${version}`);

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    
    // Check if already authenticated
    if (state.creds?.registered) {
      console.log('✅ Already authenticated! Connecting...');
      writePairingStatus({ status: 'connecting', message: 'جاري الاتصال...' });
    }

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ['OptiSize Bot', 'Chrome', '1.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // If QR code is shown, it means we need to pair
      if (qr && !paired) {
        console.log('📱 QR received - requesting pairing code instead...');
        writePairingStatus({ status: 'requesting_code', message: 'جاري طلب كود الربط...' });
        
        try {
          const code = await sock.requestPairingCode(PHONE);
          const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
          console.log('🔑 Pairing code:', formatted);
          
          const result = {
            status: 'pairing',
            code: formatted,
            rawCode: code,
            phone: PHONE,
            timestamp: Date.now(),
            steps: [
              'افتح واتساب في الموبايل',
              'روح الإعدادات → الأجهزة المرتبطة → ربط جهاز',
              'اختار "ربط برقم الهاتف"',
              `ادخل الكود: ${formatted}`
            ]
          };
          writePairingStatus(result);
          paired = true;
        } catch (e) {
          console.error('❌ Failed to request pairing code:', e.message);
          writePairingStatus({ status: 'error', message: 'فشل في طلب كود الربط: ' + e.message });
        }
      }

      if (connection === 'open') {
        console.log('✅ WhatsApp connected successfully!');
        writePairingStatus({ status: 'connected', message: 'واتساب مربوط بنجاح!', timestamp: Date.now() });
        // Keep running to maintain connection
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.log(`❌ Connection closed. Status: ${statusCode}, Reconnect: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          writePairingStatus({ status: 'reconnecting', message: 'بيحاول يتصل تاني...' });
          // Reconnect
          paired = false;
          setTimeout(() => startPairing(), 3000);
        } else {
          writePairingStatus({ status: 'logged_out', message: 'تم تسجيل الخروج - محتاج ربط جديد' });
          console.log('🔴 Logged out. Need to re-pair.');
          process.exit(1);
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      // Basic message handling - just log for now
      const m = messages[0];
      if (!m.message || m.key.fromMe) return;
      const from = m.key.remoteJid;
      const phone = from.replace('@s.whatsapp.net', '');
      const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '[media]';
      console.log(`📩 Message from ${phone}: ${text}`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    writePairingStatus({ status: 'error', message: 'خطأ: ' + error.message });
    process.exit(1);
  }
}

console.log('🚀 OptiSize Pairing Script starting...');
startPairing();

// Keep the process alive
setInterval(() => {}, 60000);
