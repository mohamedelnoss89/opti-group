import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OptiSize - الصفحة غير موجودة",
};

export default function NotFound() {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            background: #0a0e1a; 
            color: #e2e8f0; 
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
          }
          .container { padding: 2rem; }
          .code { font-size: 4rem; font-weight: bold; color: #00f0ff; margin-bottom: 1rem; }
          .title { font-size: 1.25rem; margin-bottom: 0.5rem; }
          .desc { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
          .btn {
            display: inline-block;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,128,255,0.1));
            border: 1px solid rgba(0,240,255,0.3);
            color: #00f0ff;
            border-radius: 0.75rem;
            text-decoration: none;
            font-size: 0.875rem;
            cursor: pointer;
          }
        ` }} />
      </head>
      <body>
        <div className="container">
          <div className="code">404</div>
          <div className="title">الصفحة غير موجودة</div>
          <div className="desc">عذراً، الصفحة التي تبحث عنها غير موجودة</div>
          <a href="/" className="btn">العودة للرئيسية</a>
        </div>
      </body>
    </html>
  );
}
