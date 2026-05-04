const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');

// Find and replace the entire catch block for AI errors
const oldPattern = /} catch \(aiErr\) \{[\s\S]*?log\('❌ Receipt REJECTED \(AI error\) for ' \+ phone \+ ': ' \+ aiErr\.message\);[\s\S]*?}/;

const newBlock = `} catch (aiErr) {
      log('⚠️ AI verify failed: ' + aiErr.message);
      userStates[phone] = 'awaiting_receipt';
      
      // Determine specific reason
      let reason = 'الصورة مش إيصال دفع صحيح';
      if (aiErr.message) {
        const e = aiErr.message.toLowerCase();
        if (e.includes('429') || e.includes('rate') || e.includes('limit')) {
          reason = 'السيرفر مشغول حاليا، حاول تبعت الصورة تاني بعد دقيقة';
        } else if (e.includes('400') || e.includes('invalid')) {
          reason = 'صيغة الصورة مش مدعومة، حاول تبعت صورة JPG أو PNG';
        } else if (e.includes('timeout') || e.includes('timed out')) {
          reason = 'السيرفر بطيء حاليا، حاول تبعت الصورة تاني';
        } else if (e.includes('size') || e.includes('large') || e.includes('big')) {
          reason = 'حجم الصورة كبير أوي، حاول تصغرها وتبعتها تاني';
        } else if (e.includes('content') || e.includes('moderation')) {
          reason = 'محتوى الصورة مش واضح، حاول تبعت صورة أوضح';
        } else if (e.includes('fetch') || e.includes('network') || e.includes('econnrefused')) {
          reason = 'مفيش اتصال بالسيرفر، حاول تاني بعد شوية';
        } else if (e.includes('api') || e.includes('key') || e.includes('auth') || e.includes('unauthorized')) {
          reason = 'خدمة التحقق مش متاحة حاليا، سيتم مراجعة الإيصال يدويا';
        }
      }
      
      await safeSend(from, { 
        text: '❌ الإيصال غير مقبول.\\nالسبب: ' + reason + '\\n\\nتأكد إن الإيصال بيوضح:\\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\\n- الرقم: 01028900122\\n- المبلغ: 50 جنيه بالظبط\\n- تاريخ ووقت التحويل (اليوم أو أمس)\\n\\nأي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)\\n\\nأرسل صورة الإيصال الصحيحة تاني ✅' 
      });
      log('❌ Receipt REJECTED (AI error) for ' + phone + ': ' + aiErr.message);
    }`;

if (oldPattern.test(c)) {
  c = c.replace(oldPattern, newBlock);
  fs.writeFileSync('index.js', c);
  console.log('SUCCESS: Catch block replaced with detailed reason messages!');
} else {
  console.log('ERROR: Could not find the catch block pattern.');
  console.log('Trying alternative method...');
  
  // Alternative: find any line with the old Arabic text and replace
  let modified = false;
  
  if (c.includes('الصورة المرسلة مش إيصال دفع صحيح')) {
    c = c.replace(/الصورة المرسلة مش إيصال دفع صحيح/g, 'الصورة مش إيصال دفع صحيح');
    modified = true;
  }
  if (c.includes('لو انت حولت فعلا')) {
    c = c.replace(/لو انت حولت فعلا/g, 'الإيصال غير مقبول');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync('index.js', c);
    console.log('PARTIAL: Some text replaced.');
  } else {
    console.log('FAILED: Could not modify file. Manual edit required.');
  }
}
