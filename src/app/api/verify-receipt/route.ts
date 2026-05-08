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

    const RECEIPT_VERIFY_PROMPT = `أنت نظام تحقق صارم جداً من إيصالات الدفع والتحويل المصرية. مهمتك الأساسية هي كشف الإيصالات الوهمية والمزورة.

🚨 تحذير خطير: فيه ناس بيستخدموا مواقع عمل إيصالات وهمية (زي receipt-generator و fake-receipt-maker) عشان يعملوا إيصالات مزورة. لازم تكتشف ده!

الخطوة 1: كشف الوهمي - ده أهم خطوة
- الإيصال الحقيقي من فودافون كاش: فيه شعار فودافون أحمر، تصميم التطبيق الأصلي، ألوان حقيقية، تفاصيل حقيقية اسم المرسل
- الإيصال الحقيقي من إنستاباي: فيه شعار إنستاباي، تصميم التطبيق الأصلي، ألوان حقيقية
- الإيصال الحقيقي من بنك مصري: فيه شعار البنك، تصميم التطبيق الأصلي
- الإيصال الوهمي علاماته: تصميم بسيط جداً، مفيش شعار، ألوان غريبة، خطوط نظيفة أوي، مفيش تفاصيل حقيقية للمرسل، شكله زي قالب جاهز
- لو الصورة شكلها زي إنها معمولة من موقع أو قالب جاهز → وهمي → مرفوض فوراً

الخطوة 2: تأكد إن الصورة دي فعلاً إيصال دفع أو تحويل
- لازم تشوف كلمات تدل على الدفع أو التحويل زي: "تم التحويل" أو "مرسل" أو "تم الإرسال" أو "تحويل ناجح" أو "تم الدفع" أو "Sent" أو "Paid"
- لو مفيش كلمات تدل على إن فيه دفع أو تحويل حصل → مرفوض

الخطوة 3: استخرج البيانات من الإيصال
1. الرقم المحول ليه أو رقم المستقبل
2. المبلغ المحول بالظبط
3. تاريخ التحويل (يوم/شهر/سنة)
4. وقت التحويل (ساعة:دقيقة)
5. طريقة الدفع (فودافون كاش / إنستاباي / تحويل بنكي / غيرها)

الخطوة 4: تحقق من البيانات
- الرقم لازم يكون 01028900122 بالظبط
- المبلغ لازم يكون 50 جنيه بالظبط - لو أي مبلغ تاني → مرفوض
- التاريخ لازم يكون تاريخ اليوم أو أمس فقط
- الوقت لازم يكون موجود وواضح

⚠️ قواعد صارمة:
- لو الإيصال وهمي أو فيه أي شبهة تزوير → مرفوض فوراً
- لو مفيش شعار تطبيق أو بنك واضح → مشبوه → مرفوض
- لو التصميم بسيط أوي ومفيش تفاصيل حقيقية → وهمي → مرفوض
- لو المبلغ مش 50 جنيه بالظبط → مرفوض
- لو التاريخ أقدم من أمس → مرفوض

أجب بالتنسيق ده بالظبط:
TYPE: [إيصال حقيقي / إيصال وهمي / مش إيصال / أخرى]
IS_FAKE: [نعم / لا]
FAKE_SIGNS: [لو وهمي: إيه العلامات اللي خلتك تعرف. لو حقيقي: "لا يوجد"]
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
    const aiIsFake = extractField(/IS_FAKE:\s*(.+)/);
    const aiFakeSigns = extractField(/FAKE_SIGNS:\s*(.+)/);
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

    const isRealReceipt = (aiType.includes('حقيقي') && !aiType.includes('وهمي')) || (aiType.includes('إيصال') && !aiType.includes('وهمي') && !aiType.includes('مش'));
    const isFake = aiIsFake.includes('نعم') && !aiIsFake.includes('لا');
    const hasFakeSigns = aiFakeSigns !== 'لا يوجد' && aiFakeSigns !== '' && aiFakeSigns !== 'لايوجد';
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

    const allOk = isRealReceipt && !isFake && !hasFakeSigns && hasPaymentKeyword && numberOk && amountOk && dateOk && timeOk && aiResult === 'مقبول';

    let reason = '';
    if (!isRealReceipt) reason = 'الصورة مش إيصال دفع حقيقي';
    else if (isFake) reason = '🚨 الإيصال وهمي! ' + (aiFakeSigns || 'تم اكتشاف علامات تزوير');
    else if (hasFakeSigns) reason = '🚨 الإيصال فيه علامات تزوير: ' + aiFakeSigns;
    else if (!hasPaymentKeyword) reason = 'مفيش كلمة تدل على إن فيه دفع أو تحويل حصل';
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
      details: { type: aiType, isFake: aiIsFake, fakeSigns: aiFakeSigns, keyword: aiKeyword, number: aiNumber, amount: aiAmount, date: aiDate, time: aiTime, method: aiMethod, aiResult }
    });

  } catch (error: any) {
    console.error('Receipt verification error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
  }
}
