import { NextRequest, NextResponse } from 'next/server';

// AI receipt verification endpoint - called by Replit bot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.image) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    // Secret key to prevent abuse
    const authHeader = req.headers.get('authorization');
    if (authHeader !== 'Bearer optisize-verify-2024') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const RECEIPT_VERIFY_PROMPT = `أنت نظام تحقق صارم من إيصالات الدفع والتحويل.

الخطوة 1: أولاً تأكد إن الصورة دي فعلاً إيصال دفع أو تحويل
- لازم تشوف كلمات تدل على الدفع أو التحويل زي: "تم التحويل" أو "مرسل" أو "تم الإرسال" أو "تحويل ناجح" أو "تم الدفع" أو "دفع ناجح" أو "Sent" أو "Transferred" أو "Payment" أو "Paid"
- لو مفيش كلمات تدل على إن فيه دفع أو تحويل حصل → مش إيصال دفع → مرفوض

الخطوة 2: استخرج البيانات من الإيصال
1. الرقم المحول ليه أو رقم المستقبل
2. المبلغ المحول بالظبط
3. تاريخ التحويل (يوم/شهر/سنة)
4. وقت التحويل (ساعة:دقيقة)
5. طريقة الدفع (فودافون كاش / إنستاباي / تحويل بنكي / غيرها)

الخطوة 3: تحقق من البيانات
- الرقم لازم يكون 01028900122 بالظبط
- المبلغ لازم يكون 50 جنيه بالظبط - لو أي مبلغ تاني → مرفوض
- التاريخ لازم يكون تاريخ اليوم أو أمس فقط - لو التاريخ أقدم من كده → مرفوض
- الوقت لازم يكون موجود وواضح
- طريقة الدفع ممكن تكون أي طريقة (فودافون كاش، إنستاباي، تحويل بنكي، إلخ)

⚠️ تحذيرات مهمة:
- لو المبلغ مش 50 جنيه بالظبط → مرفوض
- لو التاريخ أقدم من أمس → مرفوض
- لو مفيش كلمة تدل على الدفع أو التحويل → مرفوض
- لو الصورة مش إيصال دفع → مرفوض
- طريقة الدفع مش شرط تكون فودافون كاش - أي طريقة مقبولة

أجب بالتنسيق ده بالظبط:
TYPE: [إيصال دفع / مش إيصال / أخرى]
KEYWORD: [الكلمة اللي تدل على الدفع أو "لا يوجد"]
NUMBER: [الرقم المحول ليه]
AMOUNT: [المبلغ بالظبط]
DATE: [التاريخ]
TIME: [الوقت]
METHOD: [طريقة الدفع]
RESULT: مقبول
أو
RESULT: مرفوض
REASON: [سبب الرفض]`;

    const result = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: RECEIPT_VERIFY_PROMPT },
          { type: 'image_url', image_url: { url: body.image } }
        ]
      }],
      thinking: { type: 'disabled' }
    });

    const aiResponse = result.choices[0]?.message?.content || '';

    const extractField = (pattern: RegExp) => {
      const match = aiResponse.match(pattern);
      return match ? match[1].trim() : '';
    };

    const aiType = extractField(/TYPE:\s*(.+)/);
    const aiKeyword = extractField(/KEYWORD:\s*(.+)/);
    const aiNumber = extractField(/NUMBER:\s*(.+)/);
    const aiAmount = extractField(/AMOUNT:\s*(.+)/);
    const aiDate = extractField(/DATE:\s*(.+)/);
    const aiTime = extractField(/TIME:\s*(.+)/);
    const aiMethod = extractField(/METHOD:\s*(.+)/);
    const aiResult = extractField(/RESULT:\s*(مقبول|مرفوض)/);
    const aiReason = extractField(/REASON:\s*(.+)/);

    const REQUIRED_NUMBER = '01028900122';
    const REQUIRED_AMOUNT = '50';

    const isPaymentReceipt = aiType.includes('إيصال') || aiType.includes('دفع') || aiType.includes('Receipt');
    const hasPaymentKeyword = aiKeyword !== 'لا يوجد' && aiKeyword !== '' && aiKeyword !== 'لايوجد';
    const numberOk = aiNumber.includes(REQUIRED_NUMBER) || aiNumber.replace(/\s/g, '').includes(REQUIRED_NUMBER);

    const amountClean = aiAmount.replace(/\s/g, '');
    const amountHas50 = amountClean.includes(REQUIRED_AMOUNT);
    const amountHas500 = amountClean.includes('500');
    const amountHas5Only = /(^|[^\d])5($|[^\d])/.test(amountClean) && !amountHas50;
    const amountOk = amountHas50 && !amountHas500 && !amountHas5Only;

    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth() + 1;
    const todayYear = now.getFullYear();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yestDay = yesterday.getDate();
    const yestMonth = yesterday.getMonth() + 1;
    const yestYear = yesterday.getFullYear();

    const dateClean = aiDate.replace(/\s/g, '');

    const arabicMonths: Record<string, number> = {
      'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'إبريل': 4, 'مايو': 5, 'يونيو': 6,
      'يوليو': 7, 'أغسطس': 8, 'سبتمبر': 9, 'أكتوبر': 10, 'نوفمبر': 11, 'ديسمبر': 12
    };

    function checkDateMatch(day: number, month: number, year?: number) {
      if (day === todayDay && month === todayMonth && (year === todayYear || year === undefined)) return true;
      if (day === yestDay && month === yestMonth && (year === yestYear || year === undefined)) return true;
      return false;
    }

    let dateOk = false;

    const slashMatch = dateClean.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (slashMatch) {
      const d = parseInt(slashMatch[1]);
      const m = parseInt(slashMatch[2]);
      let y = parseInt(slashMatch[3]);
      if (y < 100) y += 2000;
      dateOk = checkDateMatch(d, m, y);
    }

    if (!dateOk) {
      const isoMatch = dateClean.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
      if (isoMatch) {
        dateOk = checkDateMatch(parseInt(isoMatch[3]), parseInt(isoMatch[2]), parseInt(isoMatch[1]));
      }
    }

    if (!dateOk) {
      for (const [monthName, monthNum] of Object.entries(arabicMonths)) {
        if (aiDate.includes(monthName)) {
          const dayMatch = aiDate.match(/(\d{1,2})/);
          const yearMatch = aiDate.match(/(\d{4})/);
          if (dayMatch) {
            dateOk = checkDateMatch(parseInt(dayMatch[1]), monthNum, yearMatch ? parseInt(yearMatch[1]) : undefined);
          }
          if (dateOk) break;
        }
      }
    }

    const timeClean = aiTime.replace(/\s/g, '');
    const timeOk = timeClean !== '' &&
      aiTime !== 'لا يوجد' &&
      aiTime !== 'لايوجد' &&
      /\d{1,2}[:.]\d{2}/.test(timeClean) &&
      parseInt(timeClean.match(/\d{1,2}/)?.[0] || '99') < 24;

    const allOk = isPaymentReceipt && hasPaymentKeyword && numberOk && amountOk && dateOk && timeOk && aiResult === 'مقبول';

    let reason = '';
    if (!isPaymentReceipt) reason = 'الصورة مش إيصال دفع';
    else if (!hasPaymentKeyword) reason = 'مفيش كلمة تدل على إن فيه دفع أو تحويل حصل (زي "تم التحويل" أو "تم الدفع")';
    else if (!numberOk && !amountOk) reason = 'الرقم والمبلغ مختلفين عن المطلوب (01028900122 - 50 جنيه)';
    else if (!numberOk) reason = 'الرقم المحول ليه مختلف عن 01028900122';
    else if (!amountOk) reason = 'المبلغ مختلف عن 50 جنيه (المبلغ في الإيصال: ' + aiAmount + ')';
    else if (!dateOk) reason = 'التاريخ مش تاريخ اليوم أو أمس (التاريخ في الإيصال: ' + aiDate + ')';
    else if (!timeOk) reason = 'مفيش وقت واضح للتحويل في الإيصال';
    else if (aiResult !== 'مقبول') reason = aiReason || 'الإيصال غير مقبول';

    return NextResponse.json({
      success: true,
      verified: allOk,
      reason,
      details: { type: aiType, keyword: aiKeyword, number: aiNumber, amount: aiAmount, date: aiDate, time: aiTime, method: aiMethod, aiResult }
    });

  } catch (error: any) {
    console.error('Receipt verification error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
  }
}
