'use client';

import { useEffect, useState } from 'react';

export default function QRPage() {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [status, setStatus] = useState('waiting');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    fetchQR();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      fetchQR();
      setCountdown(5);
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function fetchQR() {
    try {
      const res = await fetch('/api/whatsapp-qr');
      const data = await res.json();
      if (data.qr) {
        setQrSrc(data.qr);
        setStatus('qr');
      } else if (data.connected) {
        setStatus('connected');
      } else {
        setStatus('waiting');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0a0a1a',
      fontFamily: 'Arial, sans-serif',
      color: '#fff',
      padding: '20px'
    }}>
      {status === 'qr' && qrSrc && (
        <>
          <h1 style={{ color: '#00e5ff', marginBottom: '10px', fontSize: '24px' }}>
            📱 امسح الـ QR من واتساب
          </h1>
          <img
            src={qrSrc}
            alt="WhatsApp QR Code"
            style={{
              borderRadius: '16px',
              boxShadow: '0 0 40px rgba(0,229,255,0.3)',
              maxWidth: '300px',
              width: '100%'
            }}
          />
          <p style={{ color: '#aaa', marginTop: '15px', fontSize: '16px', textAlign: 'center' }}>
            افتح واتساب → الإعدادات → الأجهزة المرتبطة → ربط جهاز
          </p>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '10px' }}>
            يتم التحديث تلقائياً كل 5 ثواني...
          </p>
        </>
      )}

      {status === 'waiting' && (
        <>
          <h2 style={{ color: '#00e5ff' }}>⏳ في انتظار الـ QR كود...</h2>
          <p style={{ color: '#aaa' }}>شغّل البوت الأول: cd whatsapp-bot && node index.js</p>
        </>
      )}

      {status === 'connected' && (
        <>
          <h2 style={{ color: '#00ff88' }}>✅ البوت متصل بنجاح!</h2>
          <p style={{ color: '#aaa' }}>واتساب مربوط وشغال</p>
        </>
      )}

      {status === 'error' && (
        <>
          <h2 style={{ color: '#ff4444' }}>❌ خطأ في الاتصال</h2>
          <p style={{ color: '#aaa' }}>تأكد إن البوت شغال</p>
        </>
      )}
    </div>
  );
}
