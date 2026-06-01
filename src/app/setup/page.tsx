'use client';

import { useState } from 'react';

const SQL_SETUP = `-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for the contact form)
CREATE POLICY "Allow anonymous inserts" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Only allow service role to read messages
CREATE POLICY "Service role can read" ON contact_messages
  FOR SELECT USING (auth.role() = 'service_role');

-- Only allow service role to delete messages
CREATE POLICY "Service role can delete" ON contact_messages
  FOR DELETE USING (auth.role() = 'service_role');`;

export default function SetupPage() {
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SETUP);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = SQL_SETUP;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleTest = async () => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@test.com',
          subject: 'Setup Test',
          message: 'This is a test message from the setup page.',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult('✅ Database is working! Table exists and messages can be saved.');
      } else {
        setTestResult('❌ Database table not found. Please run the SQL above in your Supabase SQL Editor.');
      }
    } catch {
      setTestResult('❌ Connection error. Please check your network.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0a0e1a' }}
    >
      <div
        className="max-w-2xl w-full p-8 rounded-2xl"
        style={{
          background: 'rgba(26, 31, 54, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(14,165,233,0.12)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        }}
      >
        <h1
          className="text-2xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Database Setup
        </h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(192,192,192,0.5)' }}>
          Run the following SQL in your Supabase SQL Editor to create the contact_messages table.
        </p>

        {/* SQL Code Block */}
        <div
          className="relative p-4 rounded-xl mb-6 overflow-x-auto"
          style={{
            background: 'rgba(10,14,26,0.8)',
            border: '1px solid rgba(192,192,192,0.08)',
          }}
        >
          <pre
            className="text-xs leading-relaxed whitespace-pre-wrap"
            style={{ color: 'rgba(192,192,192,0.7)', fontFamily: 'monospace' }}
          >
            {SQL_SETUP}
          </pre>
        </div>

        {/* Copy button */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleCopySQL}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium cursor-pointer"
            style={{
              background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(14,165,233,0.12)',
              border: copied
                ? '1px solid rgba(34,197,94,0.2)'
                : '1px solid rgba(14,165,233,0.2)',
              color: copied ? '#22c55e' : '#0ea5e9',
            }}
          >
            {copied ? '✅ Copied!' : '📋 Copy SQL'}
          </button>

          <a
            href="https://supabase.com/dashboard/project/rebfcchrzpfteambeurb/sql"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium no-underline"
            style={{
              background: 'rgba(30,64,175,0.15)',
              border: '1px solid rgba(30,64,175,0.2)',
              color: '#38bdf8',
            }}
          >
            🔗 Open Supabase SQL Editor
          </a>
        </div>

        {/* Test button */}
        <div className="border-t" style={{ borderColor: 'rgba(192,192,192,0.06)' }}>
          <p className="text-xs mt-4 mb-3" style={{ color: 'rgba(192,192,192,0.4)' }}>
            After running the SQL, click Test to verify the setup:
          </p>
          <button
            onClick={handleTest}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(192,192,192,0.08)',
              color: 'rgba(192,192,192,0.6)',
            }}
          >
            🧪 Test Database Connection
          </button>

          {testResult && (
            <div
              className="mt-3 p-3 rounded-xl text-sm"
              style={{
                background: testResult.includes('✅')
                  ? 'rgba(34,197,94,0.08)'
                  : 'rgba(239,68,68,0.08)',
                border: testResult.includes('✅')
                  ? '1px solid rgba(34,197,94,0.15)'
                  : '1px solid rgba(239,68,68,0.15)',
                color: testResult.includes('✅') ? '#22c55e' : '#ef4444',
              }}
            >
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
