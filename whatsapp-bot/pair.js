#!/usr/bin/env node
/**
 * QR Code generator for OptiSize WhatsApp Bot
 * Uses QR code instead of pairing code (since pairing code keeps getting rejected)
 * 
 * This script:
 * 1. Connects to WhatsApp via Baileys
 * 2. Generates QR code as PNG image saved to ../public/whatsapp-qr.png
 * 3. Updates ../public/pairing.json with QR status
 * 4. Stays running to accept the scan
 * 5. Once connected, updates status to connected
 * 
 * Usage: node pair.js [--fresh]
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const PAIRING_FILE = path.join(__dirname, '..', 'public', 'pairing.json');
const QR_IMAGE_FILE = path.join(__dirname, '..', 'public', 'whatsapp-qr.png');
const AUTH_DIR = path.join(__dirname, 'auth_info');

let sock = null;

function writeStatus(data) {
  try {
    fs.writeFileSync(PAIRING_FILE, JSON.stringify(data, null, 2));
    console.log('📝 Status:', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write status:', e.message);
  }
}

// Save QR as PNG image
async function saveQrImage(qrString) {
  try {
    await QRCode.toFile(QR_IMAGE_FILE, qrString, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    console.log('🖼️ QR image saved to:', QR_IMAGE_FILE);
    return true;
  } catch (e) {
    console.error('Failed to save QR image:', e.message);
    return false;
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
writeStatus({ status: 'starting', message: 'جاري تشغيل البوت...' });

async function start() {
  try {
    console.log('🔄 Fetching latest Baileys version...');
    const { version } = await fetchLatestBaileysVersion();
    console.log(`📦 Baileys version: ${version}`);

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    if (state.creds?.registered) {
      console.log('✅ Already authenticated! Connecting...');
      writeStatus({ status: 'connecting', message: 'جاري الاتصال...' });
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

      // QR code received - save as image
      if (qr) {
        console.log('📱 QR code received!');
        writeStatus({ status: 'qr_ready', message: 'امسح الكود من واتساب', timestamp: Date.now() });
        
        // Save QR as PNG image
        const saved = await saveQrImage(qr);
        if (saved) {
          writeStatus({ 
            status: 'qr_ready', 
            message: 'امسح الكود من واتساب',
            qrImage: '/whatsapp-qr.png',
            timestamp: Date.now(),
            steps: [
              'افتح واتساب في الموبايل',
              'روح الإعدادات → الأجهزة المرتبطة → ربط جهاز',
              'امسح كود الـ QR ده',
            ]
          });
        }
      }

      if (connection === 'open') {
        console.log('✅ WhatsApp connected successfully!');
        // Remove QR image since we don't need it anymore
        try { fs.unlinkSync(QR_IMAGE_FILE); } catch {}
        writeStatus({ status: 'connected', message: 'واتساب مربوط بنجاح! ✅', timestamp: Date.now() });
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.log(`❌ Connection closed. Status: ${statusCode}, Reconnect: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          writeStatus({ status: 'reconnecting', message: 'بيحاول يتصل تاني...' });
          setTimeout(() => start(), 3000);
        } else {
          writeStatus({ status: 'logged_out', message: 'تم تسجيل الخروج - محتاج ربط جديد' });
          console.log('🔴 Logged out. Need to re-scan QR.');
          process.exit(1);
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      const m = messages[0];
      if (!m.message || m.key.fromMe) return;
      const from = m.key.remoteJid;
      const phone = from.replace('@s.whatsapp.net', '');
      const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '[media]';
      console.log(`📩 Message from ${phone}: ${text}`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    writeStatus({ status: 'error', message: 'خطأ: ' + error.message });
    process.exit(1);
  }
}

console.log('🚀 OptiSize QR Pairing Script starting...');
start();

// Keep the process alive
setInterval(() => {}, 60000);
