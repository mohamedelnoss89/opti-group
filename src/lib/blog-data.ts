export interface BlogPost {
  slug: string;
  title: { ar: string; en: string };
  excerpt: { ar: string; en: string };
  content: { ar: string; en: string };
  date: string;
  category: 'health' | 'ai' | 'tourism' | 'updates';
  readTime: number;
  author: { ar: string; en: string };
  authorRole: { ar: string; en: string };
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'optisize-launch',
    title: {
      ar: 'إطلاق أوبتي سايز: ثورة في صحة العين الرقمية',
      en: 'OptiSize Launch: A Revolution in Digital Eye Health',
    },
    excerpt: {
      ar: 'نعلن بفخر عن إطلاق تطبيق أوبتي سايز، المركز الشامل لصحة العين الذي يجمع بين قياس مسافة البؤبؤ واختبارات النظر ومعرض النظارات في تطبيق واحد.',
      en: 'We proudly announce the launch of OptiSize, the comprehensive eye health center that combines PD measurement, vision tests, and a glasses gallery in one app.',
    },
    content: {
      ar: `في عالم تتسارع فيه التطورات التقنية، يسعدنا في مجموعة أوبتي أن نعلن عن إطلاق تطبيق أوبتي سايز (OptiSize)، وهو أول تطبيق من سلسلة تطبيقاتنا المصممة لتحسين جودة حياتك. أوبتي سايز ليس مجرد تطبيق لقياس النظر، بل هو مركز شامل لصحة العين يجمع بين عدة أدوات مبتكرة في منصة واحدة سهلة الاستخدام.

من أبرز ميزات أوبتي سايز قدرته على قياس مسافة البؤبؤ (PD) بدقة عالية باستخدام كاميرا الهاتف. هذه الميزة توفر على المستخدمين عناء زيارة متجر البصريات لهذا القياس البسيط، كما تضمن دقة النتائج التي يحتاجونها عند طلب النظارات الطبية أو الشمسية عبر الإنترنت. التقنية المستخدمة تعتمد على خوارزميات متقدمة لتحليل الوجه وتحديد موضع البؤبؤ بدقة متناهية.

إلى جانب قياس مسافة البؤبؤ، يقدم التطبيق مجموعة شاملة من اختبارات النظر التي تشمل اختبار حدة البصر واختبار عمى الألوان واختبار الاستجماتيزم. هذه الاختبارات مصممة بناءً على معايير طبية معتمدة، مع واجهة تفاعلية تجعل عملية الفحص سهلة وممتعة. يمكن للمستخدمين حفظ نتائجهم وتتبع تغيراتهم عبر الوقت، مما يساعدهم على مراقبة صحة عيونهم بانتظام.

الميزة الأكثر إثارة في أوبتي سايز هي معرض النظارات التفاعلي. يمكن للمستخدمين تجربة مئات النظارات افتراضياً باستخدام تقنية الواقع المعزز، والحصول على توصيات ذكية بناءً على شكل الوجه والوصفة الطبية. هذه الميزة تجعل عملية اختيار النظارات أسهل وأمتعة من أي وقت مضى، حيث يمكنك رؤية كيف تبدو النظارات عليك قبل اتخاذ قرار الشراء.`,
      en: `In a world of rapid technological advancement, we at Opti Group are thrilled to announce the launch of OptiSize, the first app in our suite designed to improve your quality of life. OptiSize is not just a vision testing app — it is a comprehensive eye health center that combines several innovative tools in one easy-to-use platform.

One of the standout features of OptiSize is its ability to measure Pupillary Distance (PD) with high accuracy using your phone camera. This feature saves users the hassle of visiting an optical shop for this simple measurement, and ensures the accuracy of results needed when ordering prescription or sunglasses online. The technology relies on advanced algorithms for facial analysis and precise pupil positioning.

Alongside PD measurement, the app offers a comprehensive set of vision tests including visual acuity, color blindness, and astigmatism tests. These tests are designed based on established medical standards, with an interactive interface that makes the examination process easy and enjoyable. Users can save their results and track changes over time, helping them monitor their eye health regularly.

The most exciting feature in OptiSize is the interactive glasses gallery. Users can virtually try on hundreds of glasses using augmented reality technology, and receive smart recommendations based on face shape and prescription. This feature makes the process of choosing glasses easier and more fun than ever, as you can see how glasses look on you before making a purchase decision.`,
    },
    date: '2026-01-15',
    category: 'health',
    readTime: 5,
    author: { ar: 'فريق مجموعة أوبتي', en: 'Opti Group Team' },
    authorRole: { ar: 'فريق التحرير', en: 'Editorial Team' },
  },
  {
    slug: 'ai-in-healthcare',
    title: {
      ar: 'الذكاء الاصطناعي في الرعاية الصحية: مستقبل الطب في العالم العربي',
      en: 'AI in Healthcare: The Future of Medicine in the Arab World',
    },
    excerpt: {
      ar: 'كيف يُعيد الذكاء الاصطناعي تشكيل قطاع الرعاية الصحية في المنطقة العربية، وما دور مجموعة أوبتي في هذا التحول التقني.',
      en: 'How AI is reshaping healthcare in the Arab region, and Opti Group\'s role in this technological transformation.',
    },
    content: {
      ar: `يشهد العالم العربي ثورة تقنية في قطاع الرعاية الصحية، بفضل التطورات المتسارعة في مجال الذكاء الاصطناعي. من التشخيص المبكر للأمراض إلى تطوير خطط العلاج المخصصة، أصبح الذكاء الاصطناعي شريكاً لا غنى عنه في تحسين جودة الرعاية الصحية وتوسيع نطاق الوصول إليها.

في مصر والمنطقة العربية، تواجه الأنظمة الصحية تحديات كبيرة تتضمن الزيادة السكانية ونقص الكوادر الطبية المتخصصة. هنا يأتي دور الذكاء الاصطناعي كحل مبتكر يمكنه سد جزء من هذه الفجوة. أنظمة التشخيص المدعومة بالذكاء الاصطناعي يمكنها تحليل الصور الطبية بدقة تنافس الأطباء المتخصصين، مما يسرع عملية التشخيص ويقلل الأخطاء.

مجموعة أوبتي تضع الذكاء الاصطناعي في صميم استراتيجيتها لتطوير تطبيقات صحية ذكية. تطبيق أوبتي سايز هو مثال حي على كيفية استخدام خوارزميات التعلم العميق لتحليل صور العين وقياس مسافة البؤبؤ بدقة عالية. والمستقبل يحمل المزيد من التطورات، حيث نعمل على تطوير ميزات الكشف المبكر عن أمراض العيون باستخدام الذكاء الاصطناعي.

التطبيقات القادمة مثل أوبتي فيت وأوبتي نيوتريشن ستستفيد أيضاً من تقنيات الذكاء الاصطناعي لتقديم توصيات مخصصة تتناسب مع كل مستخدم. من برامج اللياقة البدنية الذكية إلى خطط التغذية المبنية على الأهداف الصحية الشخصية، يهدف الذكاء الاصطناعي إلى جعل الرعاية الصحية أكثر شخصية وفعالية.`,
      en: `The Arab world is witnessing a technological revolution in healthcare, thanks to rapid advancements in artificial intelligence. From early disease diagnosis to personalized treatment plan development, AI has become an indispensable partner in improving healthcare quality and expanding access to it.

In Egypt and the Arab region, healthcare systems face major challenges including population growth and a shortage of specialized medical staff. This is where AI comes in as an innovative solution that can bridge part of this gap. AI-powered diagnostic systems can analyze medical images with accuracy rivaling specialist doctors, speeding up the diagnosis process and reducing errors.

Opti Group places AI at the core of its strategy for developing smart health applications. The OptiSize app is a living example of how deep learning algorithms can be used to analyze eye images and measure pupillary distance with high accuracy. The future holds more developments, as we are working on early detection features for eye diseases using AI.

Upcoming apps like OptiFit and OptiNutrition will also benefit from AI technologies to provide personalized recommendations tailored to each user. From smart fitness programs to nutrition plans based on personal health goals, AI aims to make healthcare more personalized and effective.`,
    },
    date: '2026-02-01',
    category: 'ai',
    readTime: 6,
    author: { ar: 'د. رامي السيد', en: 'Dr. Rami El-Sayed' },
    authorRole: { ar: 'خبير الذكاء الاصطناعي', en: 'AI Specialist' },
  },
  {
    slug: 'egyptian-tourism-technology',
    title: {
      ar: 'تكنولوجيا السياحة المصرية: كيف تعيد التطبيقات الذكية اكتشاف الحضارة الفرعونية',
      en: 'Egyptian Tourism Technology: How Smart Apps Are Rediscovering Pharaonic Civilization',
    },
    excerpt: {
      ar: 'رحلة رقمية داخل الأهرامات ومعابد النيل: كيف تبتكر مجموعة أوبتي تجارب سياحية غامرة بتقنيات الواقع الافتراضي والمعزز.',
      en: 'A digital journey inside the Pyramids and Nile temples: How Opti Group innovates immersive tourism experiences with VR and AR technologies.',
    },
    content: {
      ar: `تتمتع مصر بأحد أغنى التراثات الحضارية في العالم، من أهرامات الجيزة الخالدة إلى معابد الأقصر المهيبة. واليوم، تفتح التكنولوجيا الحديثة أبواباً جديدة لاكتشاف هذه الروائع بطرق لم تكن ممكنة من قبل. مجموعة أوبتي تسعى لتكون في طليعة هذا التحول من خلال تطبيقاتها السياحية المبتكرة.

تطبيق أوبتي باير (OptiPyr) يقدم تجربة فريدة من نوعها: جولة افتراضية ثلاثية الأبعاد داخل أهرامات الجيزة. باستخدام تقنية النمذجة ثلاثية الأبعاد عالية الدقة، يمكن للمستخدمين استكشاف الغرف السرية والممرات الضيقة التي لا يستطيع معظم الزوار الوصول إليها فعلياً. كل جزء من الهرم مصحوب بمعلومات تاريخية مفصلة وشرح صوتي يروي قصص الفراعنة وأسرار البناء.

أما تطبيق أوبتي نايل (OptiNile) فيأخذ المستخدمين في رحلة افتراضية على متن سفينة نيلية من الأقصر إلى القاهرة. يمكن استكشاف المعابد الفرعونية على ضفاف النيل والتعرف على تاريخ كل معبد من خلال محتوى تفاعلي غني بالصور والفيديو والمعلومات التاريخية. التطبيق يدعم أيضاً تقنية الواقع المعزز (AR) التي تسمح للزوار الفعليين برؤية إعادة بناء افتراضية للمعابد في حالتها الأصلية.

هذه التطبيقات لا تهدف فقط إلى تقديم تجربة ترفيهية، بل تسعى أيضاً إلى تعزيز الوعي الثقافي والحفاظ على التراث المصري. من خلال التوثيق الرقمي الدقيق، نساهم في حفظ هذه المعالم للأجيال القادمة، ونجعلها متاحة للعالم بأسره.`,
      en: `Egypt possesses one of the richest cultural heritages in the world, from the timeless Pyramids of Giza to the majestic temples of Luxor. Today, modern technology is opening new doors to discover these wonders in ways never before possible. Opti Group aims to be at the forefront of this transformation through its innovative tourism applications.

The OptiPyr app offers a truly unique experience: a 3D virtual tour inside the Giza Pyramids. Using high-resolution 3D modeling technology, users can explore secret chambers and narrow passages that most actual visitors cannot access. Each part of the pyramid is accompanied by detailed historical information and audio narration telling the stories of the Pharaohs and the secrets of construction.

The OptiNile app takes users on a virtual Nile cruise journey from Luxor to Cairo. Users can explore Pharaonic temples along the Nile banks and learn about each temple's history through interactive content rich with photos, videos, and historical information. The app also supports Augmented Reality (AR) technology that allows actual visitors to see a virtual reconstruction of the temples in their original state.

These applications aim not only to provide an entertaining experience but also to enhance cultural awareness and preserve Egyptian heritage. Through precise digital documentation, we contribute to preserving these monuments for future generations and making them accessible to the entire world.`,
    },
    date: '2026-02-15',
    category: 'tourism',
    readTime: 7,
    author: { ar: 'مريم عبد الرحمن', en: 'Mariam Abdelrahman' },
    authorRole: { ar: 'مديرة المحتوى السياحي', en: 'Tourism Content Director' },
  },
  {
    slug: 'future-of-opti-group',
    title: {
      ar: 'مستقبل مجموعة أوبتي: رؤيتنا لعام 2026 وما بعده',
      en: 'The Future of Opti Group: Our Vision for 2026 and Beyond',
    },
    excerpt: {
      ar: 'نظرة شاملة على خارطة طريق مجموعة أوبتي للعام القادم، من إطلاق تطبيقات جديدة إلى توسيع نطاق خدماتنا في المنطقة العربية.',
      en: 'A comprehensive look at Opti Group\'s roadmap for the coming year, from launching new apps to expanding our services across the Arab region.',
    },
    content: {
      ar: `منذ تأسيس مجموعة أوبتي، كانت رؤيتنا واضحة: بناء منظومة متكاملة من التطبيقات الذكية التي تخدم جوانب متعددة من الحياة اليومية. واليوم، ونحن ننظر إلى المستقبل، نتشوق لمشاركة خططنا الطموحة لعام 2026 وما بعده.

في الربع الأول من 2026، نخطط لإطلاق النسخة المحدثة من أوبتي سايز التي ستتضمن ميزات الكشف المبكر عن أمراض العيون باستخدام الذكاء الاصطناعي. هذه الميزة ستسمح للمستخدمين بإجراء فحوصات دورية واستلام تنبيهات إذا تم رصد أي مؤشرات تستدعي استشارة طبية. نعمل أيضاً على إضافة ميزة التواصل المباشر مع أطباء العيون من خلال التطبيق.

الربع الثاني سيشهد إطلاق تطبيق أوبتي فيت، مدرب اللياقة البدنية الشخصي المدعوم بالذكاء الاصطناعي. سيتضمن التطبيق برامج تدريبية مخصصة تتكيف مع مستوى المستخدم وتقدمه، مع تتبع ذكي للتمارين وتحليل الأداء. كما سنطلق أوبتي نيوتريشن للتخطيط الغذائي الذكي.

في النصف الثاني من العام، نخطط لإطلاق تطبيقات السياحة الافتراضية أوبتي باير وأوبتي نايل، بالإضافة إلى تطبيقات الذكاء الاصطناعي أوبتي شات وأوبتي فيجن. كل تطبيق يخضع لاختبارات مكثفة لضمان جودة عالية وتجربة مستخدم سلسة.

رؤيتنا تتجاوز مجرد تطوير التطبيقات. نسعى لبناء مجتمع رقمي عربي قوي يربط بين المستخدمين والخدمات الذكية، وندعم الابتكار المحلي في المنطقة العربية. مجموعة أوبتي ليست مجرد شركة تقنية، بل هي حركة نحو مستقبل رقمي أفضل للعالم العربي.`,
      en: `Since the founding of Opti Group, our vision has been clear: to build an integrated ecosystem of smart applications that serve multiple aspects of daily life. Today, as we look to the future, we are excited to share our ambitious plans for 2026 and beyond.

In Q1 2026, we plan to launch the updated version of OptiSize that will include early detection features for eye diseases using AI. This feature will allow users to conduct regular checkups and receive alerts if any indicators are detected that warrant medical consultation. We are also working on adding a direct communication feature with eye doctors through the app.

Q2 will see the launch of OptiFit, the AI-powered personal fitness trainer. The app will include customized workout programs that adapt to the user's level and progress, with smart exercise tracking and performance analysis. We will also launch OptiNutrition for smart dietary planning.

In the second half of the year, we plan to launch the virtual tourism apps OptiPyr and OptiNile, in addition to the AI applications OptiChat and OptiVision. Each app undergoes intensive testing to ensure high quality and a smooth user experience.

Our vision goes beyond just developing apps. We seek to build a strong Arab digital community that connects users with smart services, and support local innovation in the Arab region. Opti Group is not just a tech company — it is a movement toward a better digital future for the Arab world.`,
    },
    date: '2026-03-01',
    category: 'updates',
    readTime: 6,
    author: { ar: 'إدارة مجموعة أوبتي', en: 'Opti Group Management' },
    authorRole: { ar: 'الإدارة العليا', en: 'Executive Management' },
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogPostsByCategory(category: BlogPost['category'] | 'all'): BlogPost[] {
  if (category === 'all') return blogPosts;
  return blogPosts.filter((post) => post.category === category);
}
