import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "أنت مساعد طبي متخصص في صحة العيون. أجب بالعربية. كن شاملاً ومفصلاً. حلل الأعراض خطوة بخطوة. اذكر الأسباب المحتملة بالتفصيل، وقدم نصائح عملية متعددة. اسأل أسئلة متابعة لفهم الحالة أفضل. صنف خطورة الحالة. دائماً ذكّر بزيارة الطبيب للتشخيص الدقيق. لا تصف أدوية.";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const apiMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((m: ChatMessage) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Try z-ai-web-dev-sdk first (works locally with full AI)
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();
      const response = await zai.chat.completions.create({
        model: "default",
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantMessage =
        response.choices?.[0]?.message?.content ||
        "عذراً، لم أتمكن من معالجة طلبك.";

      return NextResponse.json({ message: assistantMessage });
    } catch (sdkError) {
      console.log("z-ai-web-dev-sdk not available, using advanced medical engine");
    }

    // Advanced medical engine fallback
    const conversationHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const response = generateAdvancedResponse(lastUserMessage, conversationHistory);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Medical Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to get response",
        message:
          "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً. تذكر دائماً زيارة طبيب العيون للحصول على استشارة طبية دقيقة.",
      },
      { status: 500 }
    );
  }
}

// ============================================
// ADVANCED MEDICAL ENGINE
// ============================================

interface SymptomProfile {
  id: string;
  keywords: string[];
  name: string;
  severity: "low" | "medium" | "high" | "urgent";
  possibleCauses: string[];
  detailedAdvice: string[];
  followUpQuestions: string[];
  homeRemedies: string[];
  whenToSeeDoctor: string[];
  relatedSymptoms: string[];
}

const SYMPTOM_DATABASE: SymptomProfile[] = [
  {
    id: "dry-eyes",
    keywords: ["جفاف", "جاف", "dry", "دموع", "حرقان", "حرقة", "لزوجة"],
    name: "جفاف العين",
    severity: "medium",
    possibleCauses: [
      "قلة إنتاج الدموع الطبيعية مع تقدم العمر",
      "الاستخدام المطول للشاشات (الكومبيوتر، الهاتف) مما يقلل معدل الرمش",
      "التعرض للبيئات الجافة (تكييف، تدفئة، رياح)",
      "بعض الأدوية مثل مضادات الهيستامين ومضادات الاكتئاب",
      "أمراض مناعية مثل متلازمة سجوغرن",
      "ارتداء العدسات اللاصقة لفترات طويلة",
      "نقص فيتامين A أو أوميغا 3",
    ],
    detailedAdvice: [
      "استخدم قطرات الدموع الصناعية (المرطبة) من 4 إلى 6 مرات يومياً، واختر الأنواع الخالية من المواد الحافظة",
      "طبق قاعدة 20-20-20: كل 20 دقيقة، انظر لشيء على بعد 20 قدماً لمدة 20 ثانية",
      "أغلق عينيك تماماً لمدة 5 ثوانٍ ثم افتحهما ببطء - كرر 10 مرات كل ساعة",
      "اشرب كمية كافية من الماء (2-3 لتر يومياً) فالترطيب الداخلي مهم جداً",
      "استخدم جهاز ترطيب في الغرفة خاصة في الشتاء ومع التكييف",
      "ارتدِ نظارات واقية من الرياح عند الخروج",
      "ضع كمادات دافئة على العينين لمدة 10 دقائق مرتين يومياً لتحسين إفراز الزيوت",
    ],
    followUpQuestions: [
      "منذ متى تعاني من جفاف العين؟",
      "هل تشعر بالجفاف في الصباح أم طوال اليوم؟",
      "هل تستخدم شاشات لفترات طويلة؟",
      "هل تتناول أي أدوية حالياً؟",
      "هل ترتدي عدسات لاصقة؟",
    ],
    homeRemedies: [
      "كمادات دافئة: بلل منشفة بماء دافئ وضعها على العينين 10 دقائق",
      "تدليك الجفون: دلك الجفون بلطف بحركة دائرية لتنشيط الغدد الدهنية",
      "زيادة أوميغا 3: تناول سمك السلمون، بذور الكتان، أو الجوز",
      "الرمش الواعي: تذكر أن ترمش بوعي عند استخدام الشاشات",
    ],
    whenToSeeDoctor: [
      "إذا استمر الجفاف لأكثر من أسبوعين رغم استخدام القطرات",
      "إذا صاحبه ألم شديد أو احمرار مستمر",
      "إذا لاحظت تغيراً في الرؤية",
      "إذا كان الجفاف شديداً عند الاستيقاظ مع قشور على الجفون",
    ],
    relatedSymptoms: ["احمرار", "حرقان", "رؤية ضبابية", "إرهاق العين"],
  },
  {
    id: "blurry-vision",
    keywords: ["ضباب", "ضبابي", "تشوش", "غير واضح", "blurry", "رؤية ضعيفة", "عدم وضوح", "غموض"],
    name: "الرؤية الضبابية",
    severity: "medium",
    possibleCauses: [
      "خطأ انكسار غير مصحح (قصر أو طول نظر أو استجماتيزم)",
      "إجهاد العين من الشاشات والقراءة المطولة",
      "جفاف العين الشديد مما يؤثر على سطح القرنية",
      "بداية إعتام عدسة العين (المياه البيضاء) خاصة فوق 50 سنة",
      "ارتفاع السكر في الدم يؤثر على عدسة العين",
      "ارتفاع ضغط العين (الجلوكوما)",
      "التهاب الملتحمة أو القرنية",
      "تأثير جانبي لبعض الأدوية",
    ],
    detailedAdvice: [
      "أغلق عينيك لمدة 5 دقائق كل ساعة عند استخدام الشاشات",
      "اضبط إضاءة الشاشة لتكون مساوية لإضاءة الغرفة المحيطة",
      "حافظ على مسافة 50-70 سم بينك وبين الشاشة",
      "تأكد من نظافة نظاراتك أو عدساتك اللاصقة",
      "إذا كنت تستخدم نظارات، تأكد من أن الوصفة حديثة (فحص كل سنة)",
      "استخدم قطرات مرطبة إذا كان السبب جفاف العين",
      "تجنب القراءة في إضاءة خافتة أو مبهرة",
    ],
    followUpQuestions: [
      "هل الرؤية الضبابية في عين واحدة أم كلتاهما؟",
      "هل تكون الضبابية في الصباح أم تتزايد خلال اليوم؟",
      "هل لاحظت تحسن مؤقت عند الرمش أو فرك العين؟",
      "هل تعاني من الصداع مع الرؤية الضبابية؟",
      "هل خضعت لفحص نظر مؤخراً؟",
    ],
    homeRemedies: [
      "تمرين التركيز: امسك قلماً على بعد 30 سم، ركز عليه 10 ثوانٍ ثم انظر بعيداً 10 ثوانٍ - كرر 10 مرات",
      "تمرين حركة العين: حرك عينيك في اتجاه الساعة ثم عكسها 5 مرات",
      "الراحة الكاملة: أغلق عينيك وغطهما براحة اليد لمدة دقيقة",
      "شرب الماء بانتظام للحفاظ على ترطيب العين",
    ],
    whenToSeeDoctor: [
      "إذا ظهرت فجأة في عين واحدة",
      "إذا صاحبها ألم أو احمرار",
      "إذا استمرت أكثر من يومين",
      "إذا لاحظت ومضات ضوئية أو خيوطاً عائمة كثيرة",
      "إذا كانت مصحوبة بصداع شديد",
    ],
    relatedSymptoms: ["صداع", "إجهاد", "جفاف", "ألم"],
  },
  {
    id: "eye-pain",
    keywords: ["ألم", "وجع", "pain", "حرقان", "وخز", "طعن", "ضغط", "مضض"],
    name: "ألم العين",
    severity: "high",
    possibleCauses: [
      "إجهاد العين من التركيز المطول على الشاشات",
      "جفاف العين الشديد",
      "التهاب الملتحمة (العين الحمراء)",
      "التهاب القرنية أو القرحة القرنية",
      "ارتفاع ضغط العين (الجلوكوما الحادة)",
      "التهاب الجيوب الأنفية المنعكس على العين",
      "صداع الشقيقة (المايغرين)",
      "تهيج من المواد الكيميائية أو الأتربة",
      "إصابة أو جسم غريب في العين",
    ],
    detailedAdvice: [
      "أوقف استخدام الشاشات فوراً وأرح عينيك لمدة 30 دقيقة على الأقل",
      "ضع كمادات باردة على العينين لمدة 15 دقيقة لتخفيف الألم والالتهاب",
      "لا تفرك عينيك أبداً - الفرك يزيد التهيج",
      "إذا كنت ترتدي عدسات لاصقة، انزعها فوراً",
      "استخدم قطرات مرطبة خالية من المواد الحافظة",
      "اخفض الإضاءة المحيطة وتجنب الضوء الساطع المباشر",
      "خذ مسكناً للألم مثل الباراسيتامول إذا لزم الأمر (مع استشارة الصيدلي)",
    ],
    followUpQuestions: [
      "هل الألم في عين واحدة أم كلتاهما؟",
      "هل هو ألم مستمر أم متقطع؟",
      "هل تشعر بضغط خلف العين؟",
      "هل صاحبه احمرار أو تدميع؟",
      "هل تعرضت لأي إصابة أو دخول جسم غريب؟",
    ],
    homeRemedies: [
      "كمادات باردة: مكعبات ثلج في قماش ناعم على العين 15 دقيقة",
      "شاي الكاموميل: كمادات من شاي الكاموميل المبرد يهدئ الالتهاب",
      "شرائح خيار باردة على العينين لمدة 10 دقائق",
      "التدليك اللطيف حول العين (ليس على العين نفسها)",
    ],
    whenToSeeDoctor: [
      "إذا كان الألم شديداً ومفاجئاً - قد يكون جلوكوما حادة (طوارئ!)",
      "إذا صاحبه تغير مفاجئ في الرؤية",
      "إذا كان هناك إفرازات صديدية",
      "إذا صاحبه صداع شديد وغثيان",
      "إذا تعرضت لإصابة مباشرة في العين",
    ],
    relatedSymptoms: ["احمرار", "صداع", "رؤية ضبابية", "تدميع"],
  },
  {
    id: "headache-eye-strain",
    keywords: ["صداع", "رأس", "headache", "إجهاد", "تعب", "ضغط", "مخ", "شقيقة", "مايغرين"],
    name: "الصداع وإجهاد العين",
    severity: "medium",
    possibleCauses: [
      "إجهاد العين الرقمي من الشاشات (أكثر الأسباب شيوعاً)",
      "خطأ انكسار غير مصحح يحتم العين على التركيز بشدة",
      "توتر عضلات الرقبة والكتف المنعكس على الرأس",
      "صداع التوتر الناتج عن الضغوط النفسية",
      "الشقيقة (المايغرين) التي قد تؤثر على العين",
      "ارتفاع ضغط الدم",
      "قلة النوم أو سوء جودته",
      "جفاف العين المزمن",
    ],
    detailedAdvice: [
      "طبق قاعدة 20-20-20 بصرامة: كل 20 دقيقة، انظر لمسافة 6 أمتار لمدة 20 ثانية",
      "اضبط ارتفاع الشاشة لتكون أعلى مستوى العين بقليل",
      "استخدم فلتر الضوء الأزرق على الشاشات والنظارات",
      "خذ فترات راحة كل ساعة - قف وتمشى لمدة 5 دقائق",
      "تأكد من أن النظارات مناسبة لقراءة الشاشات (قد تحتاج نظارات كمبيوتر خاصة)",
      "حافظ على إضاءة متساوية بين الشاشة والغرفة",
      "مارس تمارين استرخاء عضلات الرقبة والكتف",
      "نم 7-8 ساعات يومياً في غرفة مظلمة",
    ],
    followUpQuestions: [
      "أين يتركز الصداع بالضبط؟ (الجبهة، الصدغ، خلف العين)",
      "هل يزداد الصداع عند استخدام الشاشات أو القراءة؟",
      "هل تشعر بحساسية للضوء مع الصداع؟",
      "هل تستخدم نظارات حالياً؟ ومتى كان آخر فحص للنظر؟",
      "كم ساعة تنام يومياً؟",
    ],
    homeRemedies: [
      "كمادات باردة على الجبهة ومحيط العين",
      "تدليك الصدغين بحركات دائرية لطيفة لمدة دقيقتين",
      "شرب الماء بكثرة - الجفاف سبب شائع للصداع",
      "التنفس العميق: شهيق 4 ثوانٍ، احباس 4 ثوانٍ، زفير 4 ثوانٍ - 10 مرات",
      "زيت النعناع: وضع قطرة على الصدغين (بعيداً عن العين)",
    ],
    whenToSeeDoctor: [
      "إذا كان الصداع جديداً وشديداً ومفاجئاً",
      "إذا صاحبه تغير في الرؤية أو ضعف في العضلات",
      "إذا كان يوقظك من النوم",
      "إذا زادت حدته أو تكراره تدريجياً",
      "إذا لم يستجب للمسكنات العادية",
    ],
    relatedSymptoms: ["رؤية ضبابية", "جفاف", "إرهاق", "دوخة"],
  },
  {
    id: "red-eyes",
    keywords: ["احمرار", "أحمر", "red", "عين حمراء", "دم", "أوعية", "حقن"],
    name: "احمرار العين",
    severity: "medium",
    possibleCauses: [
      "جفاف العين المزمن",
      "التهاب الملتحمة الفيروسي أو البكتيري (العين الحمراء المعدية)",
      "الحساسية (حمى القش أو حساسية الغبار)",
      "الاحتكاك المستمر باليدين",
      "التعب وإجهاد العين",
      "التهاب القرنية",
      "التهاب الجفن (بليفاريتيس)",
      "ارتداء العدسات اللاصقة لفترة أطول من الموصى بها",
      "فرط ضغط الدم أو اضطرابات التخثر",
    ],
    detailedAdvice: [
      "لا تفرك عينيك أبداً - الفرك يزيد الاحمرار والتهيج",
      "استخدم قطرات مرطبة خالية من المواد الحافظة كل ساعتين",
      "تجنب قطرات إزالة الاحمرار (مثل فيزين) - تسبب ارتداد الاحمرار مع الاستخدام المطول",
      "ضع كمادات باردة لمدة 10-15 دقيقة 3 مرات يومياً",
      "إذا كنت تستخدم عدسات لاصقة، استبدلها بالنظارات مؤقتاً",
      "اغسل يديك جيداً قبل لمس منطقة العين",
      "تجنب المكياج حول العين حتى يزول الاحمرار",
    ],
    followUpQuestions: [
      "هل الاحمرار في عين واحدة أم كلتاهما؟",
      "هل يصاحبه إفرازات أو تدميع؟",
      "هل تشعر بحكة مع الاحمرار؟",
      "هل لديك حساسية موسمية؟",
      "هل خالطت شخصاً يعاني من عين حمراء مؤخراً؟",
    ],
    homeRemedies: [
      "كمادات ماء باردة على العينين 15 دقيقة",
      "شرائح خيار مبردة على العينين",
      "أكياس شاي أخضر مبردة - مضاد طبيعي للالتهاب",
      "غسل العين بماء نظيف بارد عدة مرات",
    ],
    whenToSeeDoctor: [
      "إذا صاحبه ألم شديد وليس مجرد تهيج",
      "إذا كانت هناك إفرازات صديدية صفراء أو خضراء",
      "إذا لاحظت تغيراً في الرؤية",
      "إذا استمر أكثر من 3 أيام رغم الراحة",
      "إذا كان هناك حساسية شديدة للضوء",
    ],
    relatedSymptoms: ["حكة", "تدميع", "ألم", "جفاف"],
  },
  {
    id: "floaters-flashes",
    keywords: ["خيوط", "نقاط", "وميض", "floaters", "flashes", "ذباب", "عائم", "ضوء", "ومضات"],
    name: "الخيوط العائمة والومضات",
    severity: "high",
    possibleCauses: [
      "انكماش الجسم الزجاجي (طبيعي مع تقدم العمر فوق 40 سنة)",
      "انفصال الجسم الزجاجي الخلفي",
      "انفصال الشبكية (حالة طوارئ!)",
      "تمزق الشبكية",
      "نزيف داخل العين",
      "التهاب داخل العين (التهاب العنبية)",
      "إصابة الرأس أو العين",
    ],
    detailedAdvice: [
      "لا داعي للقلق من الخيوط القليلة الثابتة - شائعة مع تقدم العمر",
      "راقب أي زيادة مفاجئة في عدد الخيوط أو حجمها",
      "إذا ظهرت ومضات ضوئية جديدة، فهذا قد يشير إلى شد على الشبكية",
      "تجنب الحركات المفاجئة بالرأس والرياضات العنيفة",
      "لا تقلق - معظم الخيوط العائمة حميدة، لكن يجب المتابعة",
    ],
    followUpQuestions: [
      "هل ظهرت الخيوط فجأة أم تدريجياً؟",
      "هل تلاحظ ومضات ضوئية؟",
      "هل تشعر بستارة أو ظل يحجب جزءاً من الرؤية؟",
      "هل تعرضت لإصابة في الرأس أو العين مؤخراً؟",
      "كم عمرك؟ (الخيوط أكثر شيوعاً فوق 40 سنة)",
    ],
    homeRemedies: [
      "حرك عينيك للأعلى والأسفل - قد يحرك الخيوط خارج مجال الرؤية",
      "الراحة البصرية وتجنب الإجهاد",
      "تتبع حجم وعدد الخيوط يومياً",
    ],
    whenToSeeDoctor: [
      "زيادة مفاجئة في عدد الخيوط العائمة - طوارئ!",
      "ظهور ومضات ضوئية جديدة - طوارئ!",
      "ظهور ستارة أو ظل يحجب الرؤية - طوارئ! (انفصال شبكية)",
      "أي تغير في الخيوط بعد إصابة في الرأس أو العين",
    ],
    relatedSymptoms: ["رؤية ضبابية", "ألم", "صداع"],
  },
  {
    id: "night-vision",
    keywords: ["ليل", "ليلي", "night", "ظلام", "بصق", "عمى ليلي", "قيادة ليلاً"],
    name: "صعوبة الرؤية الليلية",
    severity: "medium",
    possibleCauses: [
      "نقص فيتامين A (أكثر الأسباب شيوعاً عالمياً)",
      "بداية إعتام عدسة العين (المياه البيضاء)",
      "قصر النظر الشديد غير المصحح",
      "التنكس البقعي المرتبط بالعمر",
      "التعرض للضوء الساطع قبل القيادة ليلاً",
      "جفاف العين (تتزايد الأعراض ليلاً)",
      "اعتلال الشبكية السكري",
      "التهاب الشبكية الصباغي (مرض وراثي)",
    ],
    detailedAdvice: [
      "تناول أطعمة غنية بفيتامين A: الجزر، البطاطا الحلوة، السبانخ، الكبد",
      "تناول أطعمة غنية باللوتين وزياكسانثين: السبانخ، اللفت، البيض",
      "أعطِ عينيك 5 دقائق للتكيف مع الظلام قبل القيادة ليلاً",
      "تجب النظر مباشرة إلى أضواء السيارات المقابلة - انظر للجانب الأيمن من الطريق",
      "نظف الزجاج الأمامي والمصابيح بانتظام",
      "استخدم نظارات مقاومة للانعكاسات ليلاً",
      "فحص السكر في الدم إذا لم تجرِ فحصاً مؤخراً",
    ],
    followUpQuestions: [
      "هل المشكلة في القيادة ليلاً فقط أم في الأماكن المظلمة عموماً؟",
      "هل تعاني من صعوبة في التكيف عند الانتقال من مكان مضيء لمكان مظلم؟",
      "هل خضعت لفحص السكر مؤخراً؟",
      "هل لديك تاريخ عائلي لأمراض العين؟",
      "هل تتناول كمية كافية من الخضروات والفواكه؟",
    ],
    homeRemedies: [
      "عصير الجزر اليومي: غني ببيتا كاروتين الذي يتحول لفيتامين A",
      "السبانخ واللفت: مصادر ممتازة لللوتين",
      "تجنب الشاشات قبل القيادة بـ 30 دقيقة",
      "تمرين التكيف: غطِّ عينيك لمدة دقيقة ثم افتحهما ببطء في الظلام",
    ],
    whenToSeeDoctor: [
      "إذا كانت صعوبة الرؤية الليلية تتعارض مع القيادة الآمنة",
      "إذا ظهرت فجأة ولم تكن تعاني منها قبل ذلك",
      "إذا صاحبها تغيرات أخرى في الرؤية",
      "إذا كنت مريض سكري",
    ],
    relatedSymptoms: ["رؤية ضبابية", "جفاف", "صداع"],
  },
  {
    id: "screen-strain",
    keywords: ["شاشة", "كمبيوتر", "موبايل", "هاتف", "computer", "screen", "رقمي", "لابتوب", "تابلت"],
    name: "إجهاد العين الرقمي",
    severity: "medium",
    possibleCauses: [
      "انخفاض معدل الرمش من 15 مرة/دقيقة إلى 5-7 مرات عند استخدام الشاشات",
      "المسافة القريبة من الشاشة تسبب إجهاد عضلات التركيز",
      "الضوء الأزرق المنبعث من الشاشات يسبب إرهاقاً بصرياً",
      "الوهج والانعكاسات على الشاشة يزيدان إجهاد العين",
      "إضاءة الشاشة أعلى أو أقل من الإضاءة المحيطة",
      "عدم وجود نظارات مناسبة للشاشات",
    ],
    detailedAdvice: [
      "طبق قاعدة 20-20-20 بصرامة: كل 20 دقيقة انظر لشيء بعيد 20 قدماً لمدة 20 ثانية",
      "اضبط إضاءة الشاشة لتكون مساوية تقريباً لإضاءة الغرفة المحيطة",
      "أبعد الشاشة 50-70 سم عن عينيك",
      "اجعل أعلى الشاشة في مستوى العين أو أقل قليلاً",
      "فعّل وضع الليل أو الفلتر الأزرق على جميع أجهزتك",
      "استخدم قطرات مرطبة كل ساعتين أثناء العمل على الشاشة",
      "فكر في شراء نظارات مخصصة للشاشات (حتى لو لم تكن تحتاج نظارات عادية)",
      "قلل وهج الشاشة باستخدام شاشة حماية مانعة للانعكاس",
    ],
    followUpQuestions: [
      "كم ساعة تقضي أمام الشاشات يومياً؟",
      "هل تستخدم أكثر من شاشة في نفس الوقت؟",
      "هل تشعر بالأعراض في نهاية يوم العمل أكثر من الصباح؟",
      "هل لديك مساحة عمل مريحة من حيث الإضاءة والارتفاع؟",
      "هل تستخدم فلتر الضوء الأزرق حالياً؟",
    ],
    homeRemedies: [
      "تمرين التركيز البعيد-القريب: انظر لشيء قريب 3 ثوانٍ ثم بعيد 3 ثوانٍ - 10 مرات",
      "تمرين الرمش: أغمض عينيك وافتحهما ببطء 20 مرة",
      "تمرين رقم 8: ارسم رقم 8 بعينيك في الهواء 5 مرات في كل اتجاه",
      "الراحة الكاملة كل ساعة: أبعد الشاشة وركز على شيء أخضر طبيعي",
    ],
    whenToSeeDoctor: [
      "إذا استمرت الأعراض رغم تطبيق نصائح الراحة",
      "إذا احتجت إلى مسكنات للصداع يومياً",
      "إذا لاحظت تغيراً في حدة البصر",
      "كل سنة على الأقل لفحص شامل للعين",
    ],
    relatedSymptoms: ["صداع", "جفاف", "رؤية ضبابية", "ألم"],
  },
  {
    id: "itching",
    keywords: ["حكة", "هرش", "itch", "itching", "مضايقة", "تهيج"],
    name: "حكة العين",
    severity: "low",
    possibleCauses: [
      "حساسية العين (التهاب الملتحمة التحسسي)",
      "جفاف العين",
      "التهاب الجفن (بليفاريتيس)",
      "دقيق العين (ديمودكس)",
      "بعض القطرات أو المستحضرات",
      "الغبار والأتربة",
      "دخان السجائر أو التلوث",
    ],
    detailedAdvice: [
      "لا تفرك عينيك أبداً - الفرك يحرر المزيد من الهيستامين ويزيد الحكة",
      "استخدم قطرات مضادة للحساسية (بعد استشارة الصيدلي)",
      "ضع كمادات باردة - البرودة تقلل الحكة فوراً",
      "اغسل الوجه والعينين بماء بارد جارٍ",
      "تجنب مسببات الحساسية (غبار، وبر حيوانات، حبوب لقاح)",
      "استبدل أغطية الوسائد أسبوعياً واغسلها بماء ساخن",
      "لا ترتدي المكياج حول العين أثناء الحكة",
    ],
    followUpQuestions: [
      "هل الحكة موسمية (تزداد في أوقات معينة من السنة)؟",
      "هل تعاني من حساسية أخرى (ربو، أكزيما، رشح)؟",
      "هل تشعر بالحكة أكثر في الداخل أم الخارج؟",
      "هل تستخدم أي قطرات للعين حالياً؟",
      "هل هناك حيوانات أليفة في المنزل؟",
    ],
    homeRemedies: [
      "كمادات ماء باردة أو ثلج ملفوف في قماش",
      "شرائح خيار باردة على العينين 10 دقائق",
      "غسول العين بمحلول ملحي خفيف (ملعقة صغيرة ملح في كوب ماء مغلي ومبرد)",
      "أكياس شاي باردة - حمض التانيك يهدئ الالتهاب",
    ],
    whenToSeeDoctor: [
      "إذا استمرت أكثر من أسبوع",
      "إذا صاحبها تورم في الجفون",
      "إذا كانت تؤثر على الرؤية",
      "إذا كان هناك إفرازات",
    ],
    relatedSymptoms: ["احمرار", "تدميع", "جفاف", "تورم"],
  },
  {
    id: "tearing",
    keywords: ["تدميع", "دموع", "بكاء", "watering", "tearing", "سيلان", "ماء"],
    name: "التدميع المفرط",
    severity: "low",
    possibleCauses: [
      "انسداد القناة الدمعية (شائع عند كبار السن)",
      "جفاف العين المزمن (رد فعل: العين تفرز دموعاً زائدة تعويضاً)",
      "الحساسية",
      "التهاب الملتحمة",
      "تهيج من الرياح أو البرد",
      "ارتخاء الجفن السفلي (مع تقدم العمر)",
      "انحراف الجفن للداخل (الشتر الداخلي)",
      "جسم غريب في العين",
    ],
    detailedAdvice: [
      "قد يكون التدميع المفرط علامة على جفاف العين - استخدم قطرات مرطبة بانتظام",
      "امسح الدموع بلطف من الزاوية الداخلية للعين للخارج بمنديل نظيف",
      "لا تمسح الدموع بيدك - تنقل البكتيريا",
      "ارتدِ نظارات واقية في الهواء الطلق",
      "تجنب التعرض المباشر للتيارات الهوائية (مكييف، مروحة)",
      "إذا كان الجفن مترخياً، جرب تدليك الزاوية الداخلية للعين بلطف",
    ],
    followUpQuestions: [
      "هل التدميع في عين واحدة أم كلتاهما؟",
      "هل تشعر بألم أو ضغط مع التدميع؟",
      "هل يزداد في الهواء الطلق؟",
      "هل لاحظت تورماً أو احمراراً في زاوية العين الداخلية؟",
      "هل تعاني من جفاف العين أيضاً؟",
    ],
    homeRemedies: [
      "كمادات دافئة على العين 10 دقائق لفتح القنوات الدمعية",
      "تدليك الزاوية الداخلية للعين بحركات دائرية لطيفة",
      "الحمام البخاري الخفيف يفتح القنوات الدمعية",
    ],
    whenToSeeDoctor: [
      "إذا كان مستمراً لأكثر من أسبوعين",
      "إذا صاحبه ألم أو تورم حول العين",
      "إذا كان في عين واحدة فقط",
      "إذا لاحظت إفرازات صديدية",
    ],
    relatedSymptoms: ["جفاف", "احمرار", "حكة", "ألم"],
  },
];

// ============================================
// CONVERSATION ENGINE
// ============================================

interface ConversationState {
  identifiedSymptoms: string[];
  currentSymptom: SymptomProfile | null;
  followUpIndex: number;
  askedFollowUps: string[];
  userResponses: string[];
  turnCount: number;
  isAnalyzing: boolean;
  hasProvidedDiagnosis: boolean;
}

function generateAdvancedResponse(
  userMessage: string,
  conversationHistory: ChatMessage[]
): string {
  const msg = userMessage.toLowerCase().trim();
  const state = analyzeConversationState(conversationHistory);

  // If user is answering a follow-up question
  if (state.currentSymptom && state.followUpIndex > 0 && !state.hasProvidedDiagnosis && state.turnCount > 1) {
    return handleFollowUpResponse(msg, state, conversationHistory);
  }

  // Try to identify symptom
  const matchedSymptoms = identifySymptoms(msg);

  if (matchedSymptoms.length > 0) {
    const primarySymptom = matchedSymptoms[0];
    state.currentSymptom = primarySymptom;
    state.followUpIndex = 0;

    // If it's urgent
    if (primarySymptom.severity === "urgent") {
      return formatUrgentResponse(primarySymptom);
    }

    // Start with initial analysis and ask first follow-up
    return formatInitialAnalysis(primarySymptom, state.identifiedSymptoms);
  }

  // Check for general questions
  if (msg.includes("شكر") || msg.includes("شكراً") || msg.includes("ممتاز") || msg.includes("تمام")) {
    return "العفو! 😊 أنا دائماً هنا لمساعدتك. تذكر:\n\n• راحة عينيك أولوية - اتبع قاعدة 20-20-20\n• الفحص الدوري للعين كل سنة مهم جداً\n• لا تتجاهل أي أعراض جديدة أو متزايدة\n\nلا تتردد في الرجوع إذا كان لديك أي استفسار آخر! 👁️";
  }

  if (msg.includes("نصيحة") || msg.includes("نصائح") || msg.includes("نصحني") || msg.includes("ايه رأيك")) {
    return "إليك أهم النصائح اليومية لصحة عينيك:\n\n🔵 روتين الحماية اليومي:\n• تناول كوب ماء كل ساعة - الترطيب من الداخل مهم\n• كل 20 دقيقة: انظر بعيداً 20 ثانية\n• انم 7-8 ساعات في غرفة مظلمة\n• اغسل عينيك بماء بارد صباحاً ومساءً\n\n🟢 غذاء العين:\n• الجزر والسبانخ (فيتامين A ولوتين)\n• سمك السلمون (أوميغا 3)\n• البيض والجوافة (فيتامين C)\n• المكسرات (فيتامين E)\n\n🔴 عادات تجنبها:\n• لا تفرك عينيك أبداً\n• لا تستخدم الشاشات في الظلام\n• لا ترتدي العدسات أثناء النوم\n• لا تتجاهل الأعراض المستمرة\n\nهل تعاني من عرض معين تريد أن نتحدث عنه بالتفصيل؟";
  }

  // Default response - guide the user
  return "أنا مساعدك الطبي المتخصص في صحة العيون 👁️\n\nيمكنني مساعدتك في:\n\n🔹 تحليل الأعراض التي تعاني منها بالتفصيل\n🔹 طرح أسئلة متابعة لفهم حالتك أفضل\n🔹 تقديم نصائح منزلية عملية\n🔹 تقييم خطورة الحالة ومتى تزور الطبيب\n\nأخبرني بما تشعر به، مثل:\n• \"أعاني من جفاف العين\"\n• \"رؤيتي تصبح ضبابية أحياناً\"\n• \"ألم في عيني عند استخدام الشاشة\"\n• \"صداع متكرر مع إجهاد العين\"\n• \"احمرار في العين\"\n\nكلما وصفت أكثر، كلما ساعدتك أفضل! 💙";
}

function analyzeConversationState(history: ChatMessage[]): ConversationState {
  const state: ConversationState = {
    identifiedSymptoms: [],
    currentSymptom: null,
    followUpIndex: 0,
    askedFollowUps: [],
    userResponses: [],
    turnCount: 0,
    isAnalyzing: false,
    hasProvidedDiagnosis: false,
  };

  // Analyze past messages - scan ALL messages to build full context
  let lastIdentifiedSymptom: SymptomProfile | null = null;

  for (const msg of history) {
    if (msg.role === "assistant") {
      // Check if we already identified a symptom in previous response
      const matchedSymptom = SYMPTOM_DATABASE.find(s =>
        msg.content.includes(s.name)
      );
      if (matchedSymptom) {
        lastIdentifiedSymptom = matchedSymptom;
      }
      // Check if we already gave comprehensive analysis
      if (msg.content.includes("🔎 التحليل التفصيلي") || msg.content.includes("التحليل التفصيلي")) {
        state.hasProvidedDiagnosis = true;
      }
      // Check if we asked follow-up questions
      if (msg.content.includes("❓")) {
        state.followUpIndex++;
      }
    }
    if (msg.role === "user") {
      state.turnCount++;
      const matched = identifySymptoms(msg.content.toLowerCase());
      if (matched.length > 0) {
        state.identifiedSymptoms = matched.map(s => s.id);
        lastIdentifiedSymptom = matched[0];
      }
    }
  }

  // Use the last identified symptom (persists through follow-up answers)
  state.currentSymptom = lastIdentifiedSymptom;

  return state;
}

function identifySymptoms(msg: string): SymptomProfile[] {
  const matched: SymptomProfile[] = [];
  for (const symptom of SYMPTOM_DATABASE) {
    if (symptom.keywords.some(kw => msg.includes(kw))) {
      matched.push(symptom);
    }
  }
  return matched;
}

function formatUrgentResponse(symptom: SymptomProfile): string {
  return `🚨 تنبيه طبي عاجل!\n\nالأعراض التي تصفها قد تشير إلى حالة تحتاج اهتماماً فورياً.\n\n⚠️ أنصحك بشدة بزيارة طبيب العيون أو قسم الطوارئ في أقرب وقت.\n\nلا تنتظر - بعض حالات العين تتفاقم بسرعة والعلاج المبكر يحمي بصرك.\n\n📞 إذا لم تستطع الوصول لطبيب عيون:\n• اذهب لأقرب مستشفى به قسم عيون\n• لا تقود السيارة بنفسك\n• لا تضع أي قطرات دون استشارة طبية`;
}

function formatInitialAnalysis(symptom: SymptomProfile, allSymptoms: string[]): string {
  const severityEmoji = {
    low: "🟢",
    medium: "🟡",
    high: "🟠",
    urgent: "🔴",
  };

  const severityText = {
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
    urgent: "عاجلة",
  };

  let response = `🔍 تحليل أولي: ${symptom.name}\n\n`;
  response += `${severityEmoji[symptom.severity]} مستوى الخطورة: ${severityText[symptom.severity]}\n\n`;
  response += `📋 الأسباب المحتملة:\n`;
  symptom.possibleCauses.slice(0, 4).forEach((cause, i) => {
    response += `  ${i + 1}. ${cause}\n`;
  });
  if (symptom.possibleCauses.length > 4) {
    response += `  ... وأسباب أخرى\n`;
  }

  response += `\n💡 نصيحة فورية:\n${symptom.detailedAdvice[0]}\n\n`;

  // Ask first follow-up question
  if (symptom.followUpQuestions.length > 0) {
    response += `❓ لكي أساعدك بشكل أدق، ${symptom.followUpQuestions[0]}`;
  }

  return response;
}

function handleFollowUpResponse(
  msg: string,
  state: ConversationState,
  history: ChatMessage[]
): string {
  const symptom = state.currentSymptom!;
  // followUpIndex counts how many ❓ we've already asked
  // So next question to ask is at index followUpIndex
  const nextQuestionIndex = state.followUpIndex;

  let response = "";

  // After asking 2+ follow-ups, give comprehensive analysis
  if (nextQuestionIndex >= 2 || nextQuestionIndex >= symptom.followUpQuestions.length) {
    return formatComprehensiveAnalysis(symptom);
  }

  // Acknowledge the response and ask next follow-up
  const acknowledgments = [
    "فهمت، شكراً للمعلومة.",
    "شكراً للتوضيح، هذا يساعدني كثيراً.",
    "ممتاز، هذا يوضح الصورة أكثر.",
    "فهمت، هذه معلومة مهمة.",
  ];
  response += acknowledgments[nextQuestionIndex % acknowledgments.length] + "\n\n";

  // Add a mini insight based on the answer
  if (msg.includes("واحدة") || msg.includes("عين واحدة") || msg.includes("يمين") || msg.includes("شمال")) {
    response += "📌 كون العرض في عين واحدة يستدعي انتباهاً خاصاً - قد يكون السبب محلياً في تلك العين.\n\n";
  } else if (msg.includes("كلتا") || msg.includes("الاتنين") || msg.includes("الثنتين")) {
    response += "📌 كون العرض في كلتا العينين غالباً يشير لسبب عام مثل الإجهاد أو الجفاف.\n\n";
  } else if (msg.includes("فجأة") || msg.includes("مفاجئ")) {
    response += "📌 الظهور المفاجئ يستدعي اهتماماً أكبر - المتابعة مع الطبيب مهمة جداً.\n\n";
  } else if (msg.includes("شاشة") || msg.includes("كمبيوتر") || msg.includes("موبايل")) {
    response += "📌 الشاشات سبب رئيسي - نصائح الراحة الرقمية ستساعدك كثيراً.\n\n";
  } else if (msg.includes("طويل") || msg.includes("أسابيع") || msg.includes("شهور") || msg.includes("3 أسابيع")) {
    response += "📌 استمرار الأعراض لفترة طويلة يعني ضرورة زيارة الطبيب للتقييم.\n\n";
  }

  // Ask next follow-up question
  if (nextQuestionIndex < symptom.followUpQuestions.length) {
    response += `❓ ${symptom.followUpQuestions[nextQuestionIndex]}`;
  }

  return response;
}

function formatComprehensiveAnalysis(symptom: SymptomProfile): string {
  const severityEmoji = {
    low: "🟢",
    medium: "🟡",
    high: "🟠",
    urgent: "🔴",
  };

  let response = `🔎 التحليل التفصيلي: ${symptom.name}\n\n`;

  // Severity
  const severityText = { low: "منخفضة", medium: "متوسطة", high: "عالية", urgent: "عاجلة" };
  response += `${severityEmoji[symptom.severity]} مستوى الخطورة: ${severityText[symptom.severity]}\n\n`;

  // All possible causes
  response += `📋 جميع الأسباب المحتملة:\n`;
  symptom.possibleCauses.forEach((cause, i) => {
    response += `  ${i + 1}. ${cause}\n`;
  });

  // Detailed advice
  response += `\n💊 نصائح عملية مفصلة:\n`;
  symptom.detailedAdvice.forEach((advice, i) => {
    response += `  ${i + 1}. ${advice}\n`;
  });

  // Home remedies
  response += `\n🏠 علاجات منزلية:\n`;
  symptom.homeRemedies.forEach((remedy, i) => {
    response += `  ${i + 1}. ${remedy}\n`;
  });

  // When to see doctor
  response += `\n👨‍⚕️ متى تزور الطبيب:\n`;
  symptom.whenToSeeDoctor.forEach((when, i) => {
    response += `  ⚠️ ${when}\n`;
  });

  // Related symptoms to watch
  if (symptom.relatedSymptoms.length > 0) {
    response += `\n👁️ أعراض مرتبطة راقبها:\n`;
    symptom.relatedSymptoms.forEach(s => {
      response += `  • ${s}\n`;
    });
  }

  response += `\n⚠️ تذكر: هذا تحليل إرشادي فقط ولا يغني عن زيارة طبيب العيون المتخصص للتشخيص الدقيق والعلاج المناسب.`;

  return response;
}
