// translations.js - القاموس الرسمي المعتمد (الرصد، المنسق الموحد، وميثاق الإحسان الحضري وشراكة المساجد)
const i18n = {
  ar: {
    dir: 'rtl',
    appName: 'بيّضها',
    appTagline: 'المنصة الرقمية للعمل التطوعي والارتقاء بالبيئة الحضرية - بلدية البيض',
    navMap: 'الخارطة التفاعلية والرصد',
    navCampaigns: 'المبادرات التطوعية',
    navIhsan: 'ميثاق الإحسان والمساجد',
    navImpact: 'سجل الإنجازات البيئية',
    navPartners: 'التنسيق المؤسساتي والوقاية',
    navReportBtn: 'تسجيل بلاغ عن نقطة سوداء',
    
    // Header & Quick Stats
    statsCleaned: 'موقع تمت معالجته',
    statsVolunteers: 'متطوع مسجل',
    statsTrees: 'شجيرة مغروسة',
    statsCampaigns: 'مبادرة منجزة',
    
    // Coordinator Access
    btnCoordinatorPortal: 'بوابة المنسق الميداني',
    coordModalTitle: 'بوابة المنسق الميداني الموحد - بلدية البيض',
    coordPinPrompt: 'يرجى إدخال الرمز السري للمنسق للمتابعة:',
    coordPinPh: 'الرمز السري (الافتراضي: 2026)',
    btnUnlockCoord: 'دخول لوحة التسيير',
    pinError: 'الرمز السري غير صحيح، يرجى المحاولة ثانية.',
    
    // Coordinator Tabs
    coordTabTriage: '1. فرز ومراجعة البلاغات',
    coordTabResolve: '2. إغلاق البلاغ وتوثيق (بعد)',
    coordTabReport: '3. التقرير البلدي الموجز',
    
    // Coordinator Actions
    coordNoSpots: 'لا توجد بلاغات نشطة بانتظار المعالجة حالياً.',
    btnDeleteSpot: 'حذف البلاغ',
    btnResolveSpotTrigger: 'معالجة وتوثيق الإنجاز',
    labelSelectSpotToResolve: 'اختر النقطة السوداء المنجزة:',
    labelAfterPhoto: 'صورة الموقع بعد انتهاء التنظيف (صورة واحدة):',
    labelCleanedByOrg: 'الجهة التي أنجزت التدخل الميداني:',
    phCleanedByOrg: 'مثال: عمال مصلحة النظافة لبلدية البيض + فوج الفلاح للكشافة',
    btnSubmitResolution: 'اعتماد وتوثيق الفضاء في سجل الإنجازات',
    toastSpotResolved: 'تم إغلاق البلاغ وتوثيقه بنجاح في سجل الإنجازات البيئية (قبل/بعد).',
    toastSpotDeleted: 'تم حذف البلاغ من الخارطة.',
    
    // Coordinator Municipal Report
    coordReportTitle: 'التقرير الميداني الدوري الجاهز للإرسال (WhatsApp / SMS):',
    btnCopyReport: 'نسخ التقرير الميداني بنقرة واحدة',
    toastReportCopied: 'تم نسخ التقرير إلى الحافظة، يمكنك لصقه وإرساله للمسؤولين.',
    
    // ==========================================
    // ISLAMIC CIVIC CHARTER & MOSQUE ALLIANCE
    // ==========================================
    ihsanHeaderTitle: 'ميثاق الإحسان الحضري وتويزة المساجد ولجان الأحياء',
    ihsanHeaderSubtitle: 'تأصيل العمل البيئي كقيمة إيمانية وسنة نبوية راسخة تعزز التضامن الجواري في مدينة البيض',
    
    hadithSectionTitle: 'الأصول الشرعية والسنن النبوية في طهارة المحيط والغرس',
    hadith1Title: 'إماطة الأذى شعبة من شعب الإيمان',
    hadith1Text: 'قال رسول الله ﷺ: «الإيمانُ بضعٌ وسبعونَ شُعبةً، فأفضلُها قولُ لا إله إلا الله، وأدناها إماطةُ الأذى عن الطريق».',
    hadith1Source: 'صحيح مسلم',
    
    hadith2Title: 'الغرس والتشجير صدقة جارية ونماء للأرض',
    hadith2Text: 'قال رسول الله ﷺ: «ما من مسلمٍ يَغرِسُ غَرْسًا، أو يَزرَعُ زَرْعًا، فيأكُلُ منه طيرٌ أو إنسانٌ أو بهيمةٌ، إلا كان له به صدقةٌ».',
    hadith2Source: 'متفق عليه',
    
    hadith3Title: 'الإحسان في الفضاء العام ومغفرة الذنوب',
    hadith3Text: 'قال رسول الله ﷺ: «بينما رجلٌ يَمشي بطريقٍ وَجَدَ غُصْنَ شَوْكٍ على الطريقِ فأخَّرَه، فشَكَرَ اللهُ له فَغَفَرَ له».',
    hadith3Source: 'صحيح البخاري',
    
    mosqueAllianceTitle: 'بروتوكول "تويزة المسجد والحي" للتوعية والعمل الميداني',
    mosquePoint1Title: '1. المنبر المسجدي والتوعية في خطب الجمعة',
    mosquePoint1Desc: 'تخصيص أئمة المساجد حيزاً من خطبة الجمعة أو الدروس الجوارية لحث المصلين على ترشيد النظافة أمام البيوت وصيانة المرافق العامة كواجب ديني وأخلاقي.',
    
    mosquePoint2Title: '2. حملات "طهارة المحيط" بعد صلاة الفجر والجمعة',
    mosquePoint2Desc: 'تنسيق لجان الأحياء وشباب المسجد لتنظيم انطلاقات ميدانية دورية (ساعة واحدة من العمل التشاركي) لرفع الأكياس وكنس محيط المسجد والساحات المجاورة.',
    
    mosquePoint3Title: '3. مبادرة "الوقف الأخضر" وتبني الشجيرات',
    mosquePoint3Desc: 'تشجيع المحسنين والعائلات على غرس شجيرات صنوبر أو بطم أمام المنازل وتعهدها بالسقي كصدقة جارية مأجورة عن الوالدين وعن الموتى.',
    
    // Mosque Campaign Poster Generator Tool
    posterToolTitle: 'أداة توليد ملصق الإعلان المسجدي والجداري (A4 Printable)',
    posterToolSubtitle: 'مولد فوري لملصق الإعلان عن المبادرة التطوعية لتعليقه في لوحة إعلانات المسجد والمحلات الجوارية أو مشاركته عبر WhatsApp',
    labelSelectCampForPoster: 'اختر المبادرة لتوليد ملصقها:',
    btnGeneratePoster: 'معاينة وطباعة الملصق المسجدي (A4)',
    btnPrintPoster: 'طباعة الملصق المسجدي 🖨️',
    
    // Good Neighborhood Charter
    charterTitle: 'ميثاق الجوار النظيف وحسن المعاشرة الحضرية',
    charterItem1: 'احترام مواعيد مرور شاحنات جمع النفايات المنزلية ووضع الأكياس محكمة الإغلاق.',
    charterItem2: 'الامتناع التام عن رمي مخلفات البناء والردام في مجاري الأودية والساحات العمومية.',
    charterItem3: 'المحافظة على الحاويات البلدية ونظافة واجهات المنازل والمحلات التجارية.',
    charterItem4: 'المشاركة الفعالة في مبادرات "التويزة" الدورية كحق من حقوق الجوار الصالح.',

    // Map Controls & Filters
    filterAll: 'كافة المواقع',
    filterBlackspots: 'نقاط سوداء مرصودة',
    filterCampaigns: 'مبادرات مبرمجة',
    filterResolved: 'فضاءات مؤهلة ومسترجعة',
    myLocation: 'تحديد موقعي الجغرافي',
    mapLegend: 'دليل ورصد الأحياء الحضرية',
    legendBlackspot: 'نقطة سوداء تستوجب التدخل',
    legendCampaign: 'مبادرة تطوعية مبرمجة',
    legendResolved: 'فضاء تم تنظيفه وإعادة تأهيله',
    viewToggleMap: 'عرض الخارطة',
    viewToggleList: 'عرض القائمة',
    
    // Proximity & Duplicate Prevention
    proximityAlertTitle: 'تنبيه: يوجد بلاغ قائم بالقرب من هذا الموقع',
    proximityAlertDesc: 'تم رصد نقطة سوداء مسبقاً على بعد {dist} متراً من موقعك. تفادياً لتكرار البيانات، يمكنك تأكيد البلاغ القائم لرفع درجة استعجاله لدى المصالح المعنية.',
    btnConfirmExisting: 'تأكيد ودعم هذا البلاغ القائم (+1 تأكيد)',
    btnConfirmedAlready: 'لقد أكدت هذا البلاغ مسبقاً ✓',
    btnProceedAnyway: 'متابعة تسجيل بلاغ منفصل',
    upvotesCount: 'مواطناً أكدوا هذا البلاغ',
    btnUpvoteSpot: 'تأكيد وجود هذه النقطة',
    
    // Structured Report Modal
    reportTitle: 'تسجيل بلاغ عن نقطة سوداء أو تشوه بيئي',
    reportSubtitle: 'المساهمة في المجهود المحلي لمكافحة المكبات العشوائية وتحديد العتاد اللازم للتدخل',
    
    labelPhotoLoc: '1. المعاينة المصورة والإحداثيات الميدانية',
    photoHint: 'انقر لالتقاط صورة مباشرة أو استيرادها (يتم ضغطها تلقائياً)',
    locDetected: 'تم التقاط الموقع التلقائي',
    locNotDetected: 'انقر لتحديد الإحداثيات',
    btnAutoGPS: 'تحديد موقعي التلقائي',
    btnPickOnMap: 'تعديل أو تحديد على الخارطة',
    
    labelNeighbourhood: '2. الحي / التجمع السكاني (كتابة يدوية) *',
    phNeighbourhood: 'اكتب اسم الحي أو المعلم المجاور (مثال: حي المصالحة، وادي الفحم، حي السلام...)',
    
    labelVolume: '3. الحجم التقديري ونوع التدخل والعتاد المطلوب *',
    volLightTitle: 'حجم محدود (تدخل يدوي)',
    volLightDesc: 'مجهود تطوعي بأكياس جمع وقفازات عبر حملة شبابية بسيطة.',
    volMediumTitle: 'حجم متوسط (شاحنة نقل 3.5 طن)',
    volMediumDesc: 'يستلزم مساندة شاحنة نقل تابعة للبلدية لرفع الأكياس والكتل.',
    volHeavyTitle: 'حجم ضخم (آليات ثقيلة وجرافة)',
    volHeavyDesc: 'يستوجب جرافة (Rétrochargeur) وشاحنات ذات حمولة كبرى لرفع الردم.',
    
    labelMaterials: '4. المكونات الغالبة على النفايات (اختر ما ينطبق)',
    matPlastic: 'أكياس ومواد بلاستيكية',
    matRubble: 'ردام وركام أشغال بناء',
    matOrganic: 'نفايات منزلية عضوية',
    matTires: 'إطارات وعجلات مطاطية',
    matMetal: 'خردة ومعادن صلبة',
    matGreen: 'بقايا تقليم أشجار وأعشاب',
    
    labelAccess: '5. مسلك وصول الشاحنات والآليات',
    accessPaved: 'مسلك معبد ومتاح للشاحنات الكبرى',
    accessNarrow: 'مسلك ضيق أو تضاريس وعرة (وصول يدوي فقط)',
    
    labelNotes: '6. ملاحظات إضافية أو معلم مميز (اختياري)',
    phNotes: 'أي توضيح يفيد فرق التدخل الميداني...',
    
    btnSubmitReport: 'اعتماد وتسجيل البلاغ فوراً',
    
    // Campaign Card & Hub
    campaignsTitle: 'المبادرات التطوعية وحملات "التويزة" المبرمجة',
    campaignsSubtitle: 'تنظيم وتوحيد الجهود الميدانية لجمعيات المجتمع المدني والمواطنين بالتنسيق مع المصالح العمومية',
    btnNewCampaign: 'إدراج مبادرة تطوعية جديدة',
    btnJoinCampaign: 'تأكيد المشاركة في المبادرة',
    btnJoined: 'تم تسجيل مشاركتكم بنجاح',
    campaignDate: 'تاريخ وتوقيت الانطلاق',
    campaignLocation: 'نقطة التجمع والانطلاق',
    campaignOrganizer: 'الهيئة المبادرة / المنظمة',
    campaignTarget: 'الأهداف الميدانية المسطرة',
    campaignToolsNeeded: 'الوسائل والعتاد المستلزم',
    campaignVolunteers: 'متطوع مسجل في المبادرة',
    
    // New Campaign Modal
    newCampaignTitle: 'برمجة مبادرة تطوعية ميدانية',
    newCampaignSubtitle: 'تأطير حملة نظافة، تشجير، أو تهيئة حضرية بالتنسيق مع لجان الأحياء والجهات الوصية',
    labelCampTitle: 'عنوان المبادرة التطوعية *',
    phCampTitle: 'مثال: حملة تطهير مجرى وادي الفحم وغرس شجيرات الصنوبر',
    labelCampType: 'طبيعة النشاط التطوعي',
    typeClean: 'رفع النفايات وتنظيف المحيط العمراني',
    typeTree: 'تشجير وغرس أصناف نباتية ملائمة للمناخ السهبي',
    typePaint: 'طلاء الأرصفة وتجميل الفضاءات العامة',
    typeWadi: 'تنقية وتطهير مجاري الأودية ومنافذ تصريف الأمطار',
    labelCampDate: 'موعد وساعة الانطلاق *',
    labelCampMeeting: 'مكان التجمع الميداني المحدد *',
    phCampMeeting: 'مثال: ساحة مسجد السلام - الساعة 08:00 صباحاً',
    labelCampTools: 'العتاد والمعدات المطلوبة (مفصولة بفواصل)',
    phCampTools: 'قفازات سميكة، أكياس سعة 100 لتر، مجارف، مياه صالحة للشرب...',
    labelCampOrg: 'الجهة المبادرة أو الجمعية المنظمة',
    phCampOrg: 'مثال: الكشافة الإسلامية الجزائرية (فوج الفلاح) بالتنسيق مع لجنة الحي',
    btnSubmitCampaign: 'اعتماد ونشر المبادرة للعموم',
    
    // Before & After Section
    impactTitle: 'سجل التحول والارتقاء البيئي (قبل / بعد)',
    impactSubtitle: 'توثيق ميداني مصور للفضاءات المسترجعة بفضل تظافر جهود المتطوعين والمؤسسات العمومية',
    slideHint: 'حرك المؤشر للمقارنة البصرية الدقيقة بين الوضع السابق والراهن',
    badgeResolved: 'موقع مسترجع ومؤهل بالكامل',
    cleanedBy: 'أُنجز التدخل بمساهمة:',
    
    // Partners & Institutional Support
    partnersTitle: 'التنسيق المؤسساتي والوقاية العامة',
    partnersSubtitle: 'تكامل العمل التطوعي للمجتمع المدني مع المخططات البلدية والولائية للنظافة وحماية البيئة',
    partnerApcTitle: 'المجلس الشعبي البلدي لبلدية البيض',
    partnerApcDesc: 'تسخير شاحنات النقل والعتاد الثقيل نحو مركز الردم التقني للنفايات (CET)، وتوفير حاويات جمع القمامة.',
    partnerForestTitle: 'محافظة الغابات لولاية البيض',
    partnerForestDesc: 'توفير الشتلات المتأقلمة مع المناخ القاري (الصنوبر الحلبي، البطم الأطلسي) والتأطير التقني لعمليات التشجير ومكافحة التصحر.',
    partnerCivilTitle: 'مديرية الحماية المدنية لولاية البيض',
    partnerCivilDesc: 'تأمين سلامة المتطوعين والإشراف على تنقية مجاري الأودية ونقاط تجمع المياه تفادياً لمخاطر الفيضانات الموسمية.',
    partnerSecurityTitle: 'مصالح الأمن والدرك الوطنيين والصحة العمومية',
    partnerSecurityDesc: 'تنظيم الحملات التحسيسية للوقاية من الآفات الاجتماعية، السلامة المرورية، وحماية الصحة العامة.',
    
    // Tips & Awareness Cards
    tipsTitle: 'دليل السلامة الميدانية وحسن التدبير البيئي',
    tip1Title: 'قواعد السلامة والوقاية الشخصية',
    tip1Desc: 'إلزامية ارتداء قفازات عمل واقية وأحذية صلبة، وتفادي التقاط النفايات الحادة أو الزجاجية باليدين المجردتين.',
    tip2Title: 'الفرز الانتقائي للمخلفات',
    tip2Desc: 'عزل المواد البلاستيكية والكرتون في أكياس مخصصة لتسهيل عمليات الفرز وتوجيهها نحو مسالك الاسترجاع والرسكلة.',
    tip3Title: 'المعايير التقنية للغرس في الوسط السهبي',
    tip3Desc: 'اعتماد الأصناف المقاومة للجفاف والبرودة القارصة، مع تهيئة أحواض سقي مقعرة لتجميع مياه السيلان الطبيعي.',
    
    // Feedback / Toasts
    toastReportSuccess: 'تم تسجيل البلاغ بنجاح وإدراجه ضمن الخارطة التفاعلية.',
    toastUpvoteSuccess: 'شكراً لتأكيدك! تم إضافة صوتك لرفع أولوية معالجة هذا الموقع.',
    toastJoinSuccess: 'تم تأكيد تسجيل مشاركتكم في هذه المبادرة التطوعية.',
    toastCampaignSuccess: 'تم نشر وتعميم المبادرة التطوعية بنجاح.',
    
    // Footer
    footerText: 'منصة بيّضها - أداة رقمية تشاركية لخدمة الصالح العام والارتقاء بالمحيط العمراني والبيئي لبلدية البيض.',
    footerCredits: 'تطوير: مبادرة تكنولوجية مستقلة لدعم جهود التنمية المستدامة والمجتمع المدني'
  },
  
  fr: {
    dir: 'ltr',
    appName: 'Bayedha',
    appTagline: 'Plateforme citoyenne de salubrité publique et valorisation environnementale - El Bayadh',
    navMap: 'Cartographie & Signalement',
    navCampaigns: 'Actions Citoyennes',
    navIhsan: 'Éco-Civisme & Mosquées',
    navImpact: 'Registre des Réalisations',
    navPartners: 'Coordination & Prévention',
    navReportBtn: 'Déposer un signalement',
    
    // Header & Quick Stats
    statsCleaned: 'Sites réhabilités',
    statsVolunteers: 'Bénévoles mobilisés',
    statsTrees: 'Arbustes plantés',
    statsCampaigns: 'Actions achevées',
    
    // Coordinator Access
    btnCoordinatorPortal: 'Espace Coordinateur',
    coordModalTitle: 'Portail du Coordinateur Unique - El Bayadh',
    coordPinPrompt: 'Veuillez saisir le code PIN de coordination :',
    coordPinPh: 'Code PIN (Défaut : 2026)',
    btnUnlockCoord: 'Accéder à la gestion',
    pinError: 'Code PIN erroné. Veuillez réessayer.',
    
    // Coordinator Tabs
    coordTabTriage: '1. Modération & Tri',
    coordTabResolve: '2. Clôturer & Documenter',
    coordTabReport: '3. Synthèse Communale',
    
    // Coordinator Actions
    coordNoSpots: 'Aucun signalement en attente pour le moment.',
    btnDeleteSpot: 'Supprimer',
    btnResolveSpotTrigger: 'Résoudre & Documenter',
    labelSelectSpotToResolve: 'Sélectionnez le site assaini :',
    labelAfterPhoto: 'Cliché du site après réhabilitation (1 photo) :',
    labelCleanedByOrg: 'Structure ayant conduit l\'intervention :',
    phCleanedByOrg: 'Ex: Agents communaux APC + Groupe Scouts SMA',
    btnSubmitResolution: 'Publier dans le Registre des Réalisations',
    toastSpotResolved: 'Point noir résolu et archivé avec succès dans le registre Avant/Après.',
    toastSpotDeleted: 'Signalement supprimé de la cartographie.',
    
    // Coordinator Municipal Report
    coordReportTitle: 'Synthèse opérationnelle prête à transmettre (WhatsApp / SMS) :',
    btnCopyReport: 'Copier la synthèse en un clic',
    toastReportCopied: 'Synthèse copiée dans le presse-papier.',
    
    // ==========================================
    // ISLAMIC CIVIC CHARTER & MOSQUE ALLIANCE
    // ==========================================
    ihsanHeaderTitle: 'Charte d\'Éco-Civisme et Alliance des Mosquées & Comités de Quartier',
    ihsanHeaderSubtitle: 'Ancrer l\'action environnementale dans les valeurs éthiques et la tradition de solidarité communautaire (Touiza)',
    
    hadithSectionTitle: 'Fondements Éthiques et Préceptes de Salubrité et de Reboisement',
    hadith1Title: 'L\'enlèvement des nuisances comme acte de foi',
    hadith1Text: 'Le Prophète ﷺ a dit : « La foi comporte plus de soixante-dix branches... et la plus modeste est d\'enlever ce qui nuit sur la voie publique. »',
    hadith1Source: 'Sahih Muslim',
    
    hadith2Title: 'La plantation d\'arbres comme aumône continue',
    hadith2Text: 'Le Prophète ﷺ a dit : « Chaque fois qu\'un musulman plante un arbre ou sème une graine et qu\'un oiseau, un homme ou une bête en mange, cela lui est compté comme une aumône. »',
    hadith2Source: 'Muttafaq \'alaih',
    
    hadith3Title: 'La bienfaisance dans l\'espace public',
    hadith3Text: 'Le Prophète ﷺ a dit : « Un homme qui cheminait trouva une branche d\'épines sur la route et la retira ; Dieu lui en sut gré et lui accorda Son pardon. »',
    hadith3Source: 'Sahih Al-Bukhari',
    
    mosqueAllianceTitle: 'Protocole "Touiza Mosquée & Quartier" : Mobilisation de Proximité',
    mosquePoint1Title: '1. Tribune de la Mosquée et Sensibilisation du Vendredi',
    mosquePoint1Desc: 'Les imams consacrent un moment lors des prêches pour rappeler aux fidèles le devoir civique et religieux de propreté devant les demeures et les commerces.',
    
    mosquePoint2Title: '2. Opérations "Quartier Propre" après la prière du Vendredi ou de l\'Aube',
    mosquePoint2Desc: 'Coordination entre comités de quartier et jeunes pour organiser des sessions d\'assainissement ciblées d\'une heure autour des mosquées et des places.',
    
    mosquePoint3Title: '3. Initiative "Waqf Vert" et Parrainage d\'Arbustes',
    mosquePoint3Desc: 'Encourager les familles et bienfaiteurs à planter et arroser des pins d\'Alep devant leurs résidences comme aumône continue pérenne.',
    
    // Mosque Campaign Poster Generator Tool
    posterToolTitle: 'Générateur d\'Affiche d\'Information Communautaire (Format A4)',
    posterToolSubtitle: 'Outil de génération instantanée d\'affiche officielle prête à imprimer et placarder sur les panneaux de la mosquée ou à diffuser sur WhatsApp',
    labelSelectCampForPoster: 'Sélectionnez l\'opération citoyenne :',
    btnGeneratePoster: 'Aperçu & Impression de l\'Affiche (A4)',
    btnPrintPoster: 'Imprimer l\'Affiche 🖨️',
    
    // Good Neighborhood Charter
    charterTitle: 'Charte du Bon Voisinage et Respect du Cadre de Vie',
    charterItem1: 'Respect strict des horaires de collecte des ordures ménagères dans des sacs hermétiques.',
    charterItem2: 'Interdiction totale de déverser des gravats et déblais de chantiers dans les lits d\'oueds et les espaces publics.',
    charterItem3: 'Préservation des bacs à ordures communaux et maintien de la propreté des façades et devantures.',
    charterItem4: 'Participation active aux journées collectives de "Touiza" comme marque de civisme et de fraternité.',

    // Map Controls & Filters
    filterAll: 'Tous les sites',
    filterBlackspots: 'Points noirs recensés',
    filterCampaigns: 'Actions programmées',
    filterResolved: 'Espaces réhabilités',
    myLocation: 'Me géolocaliser',
    mapLegend: 'Registre cartographique urbain',
    legendBlackspot: 'Point noir nécessitant une résorption',
    legendCampaign: 'Opération de volontariat planifiée',
    legendResolved: 'Site assaini et réhabilité',
    viewToggleMap: 'Vue Carte',
    viewToggleList: 'Vue Liste',
    
    // Proximity & Duplicate Prevention
    proximityAlertTitle: 'Attention : Signalement existant à proximité',
    proximityAlertDesc: 'Un point noir est déjà enregistré à {dist} mètres de votre position. Pour éviter les doublons, vous pouvez appuyer ce signalement existant afin d\'en accroître la priorité.',
    btnConfirmExisting: 'Appuyer et confirmer ce signalement (+1 vote)',
    btnConfirmedAlready: 'Vous avez déjà appuyé ce signalement ✓',
    btnProceedAnyway: 'Créer un signalement distinct malgré tout',
    upvotesCount: 'citoyens ont appuyé ce signalement',
    btnUpvoteSpot: 'Confirmer ce point noir',
    
    // Structured Report Modal
    reportTitle: 'Déposer un signalement de dégradation ou point noir',
    reportSubtitle: 'Participez à la cartographie des décharges sauvages et à la qualification du matériel d\'intervention requis',
    
    labelPhotoLoc: '1. Constat photographique et géolocalisation',
    photoHint: 'Cliquez pour capturer ou importer un cliché (Compression automatique)',
    locDetected: 'Position automatique enregistrée',
    locNotDetected: 'Cliquez pour enregistrer les coordonnées',
    btnAutoGPS: 'Géolocalisation automatique',
    btnPickOnMap: 'Pointer sur la carte',
    
    labelNeighbourhood: '2. Quartier / Secteur urbain (Saisie manuelle) *',
    phNeighbourhood: 'Nom du quartier ou repère (Ex: Cité El Moussalaha, Oued El Fahm, Cité Essalam...)',
    
    labelVolume: '3. Volume estimé et moyens logistiques requis *',
    volLightTitle: 'Volume limité (Intervention manuelle)',
    volLightDesc: 'Action bénévole avec sacs et gants via une opération citoyenne simple.',
    volMediumTitle: 'Volume moyen (Camion benne 3.5T)',
    volMediumDesc: 'Nécessite l\'appui d\'un camion communal pour l\'évacuation des sacs.',
    volHeavyTitle: 'Volume majeur (Engins lourds et rétrochargeur)',
    volHeavyDesc: 'Exige un rétrochargeur et des bennes de grand gabarit pour les déblais massifs.',
    
    labelMaterials: '4. Typologie dominante des déchets (Sélectionnez)',
    matPlastic: 'Sacs et résidus plastiques',
    matRubble: 'Gravats et déblais de chantiers',
    matOrganic: 'Déchets ménagers organiques',
    matTires: 'Pneumatiques usagés',
    matMetal: 'Ferraille et objets métalliques',
    matGreen: 'Déchets verts et branchages',
    
    labelAccess: '5. Accessibilité pour les engins et bennes',
    accessPaved: 'Voie carrossable accessible aux poids lourds',
    accessNarrow: 'Voie étroite ou terrain accidenté (Accès piétonnier seul)',
    
    labelNotes: '6. Précisions complémentaires (Optionnel)',
    phNotes: 'Toute observation utile aux équipes de terrain...',
    
    btnSubmitReport: 'Valider et transmettre le signalement',
    
    // Campaign Card & Hub
    campaignsTitle: 'Opérations de Volontariat et "Touiza" Programmées',
    campaignsSubtitle: 'Mobilisation coordonnée des forces vives associatives et citoyennes en synergie avec les services publics',
    btnNewCampaign: 'Programmer une nouvelle opération',
    btnJoinCampaign: 'Confirmer mon engagement',
    btnJoined: 'Participation confirmée',
    campaignDate: 'Date et horaires d\'intervention',
    campaignLocation: 'Point de rassemblement',
    campaignOrganizer: 'Organisateur / Structure porteuse',
    campaignTarget: 'Objectifs opérationnels fixés',
    campaignToolsNeeded: 'Moyens logistiques et outillage requis',
    campaignVolunteers: 'Bénévoles inscrits',
    
    // New Campaign Modal
    newCampaignTitle: 'Planifier une opération d\'intérêt général',
    newCampaignSubtitle: 'Encadrer une campagne d\'assainissement ou de reboisement en liaison avec les comités de quartier',
    labelCampTitle: 'Intitulé de l\'opération *',
    phCampTitle: 'Ex: Curage préventif d\'Oued El Fahm et reboisement des berges',
    labelCampType: 'Nature de l\'intervention',
    typeClean: 'Assainissement, collecte et évacuation des déchets',
    typeTree: 'Reboisement avec des espèces adaptées au milieu steppique',
    typePaint: 'Rénovation des bordures de trottoirs et fresques',
    typeWadi: 'Curage préventif des lits d\'oueds et exutoires pluviaux',
    labelCampDate: 'Date et heure de lancement *',
    labelCampMeeting: 'Point de ralliement exact *',
    phCampMeeting: 'Ex: Placette de la mosquée Essalam - 08h00',
    labelCampTools: 'Matériel nécessaire (séparé par des virgules)',
    phCampTools: 'Gants de protection, sacs 100L, pelles, eau potable...',
    labelCampOrg: 'Collectif ou Association promotrice',
    phCampOrg: 'Ex: Scouts SMA (Groupe El Fellah) en coordination avec le comité de quartier',
    btnSubmitCampaign: 'Publier et diffuser l\'opération',
    
    // Before & After Section
    impactTitle: 'Registre des Réalisations et Réhabilitations (Avant / Après)',
    impactSubtitle: 'Traçabilité visuelle des sites assainis grâce à la synergie citoyenne et institutionnelle',
    slideHint: 'Faites coulisser le curseur pour apprécier l\'ampleur de la réhabilitation',
    badgeResolved: 'Site intégralement assaini et réhabilité',
    cleanedBy: 'Intervention menée sous la conduite de :',
    
    // Partners & Institutional Support
    partnersTitle: 'Coordination Institutionnelle & Prévention',
    partnersSubtitle: 'Complémentarité entre l\'engagement citoyen et les schémas directeurs communaux de salubrité',
    partnerApcTitle: 'Assemblée Populaire Communale (APC d\'El Bayadh)',
    partnerApcDesc: 'Acheminement des bennes de collecte vers le Centre d\'Enfouissement Technique (CET) et mise à disposition de moyens mécanisés.',
    partnerForestTitle: 'Conservation des Forêts de la Wilaya d\'El Bayadh',
    partnerForestDesc: 'Fourniture d\'essences forestières résilientes (Pin d\'Alep, Pistachier de l\'Atlas) et encadrement technique sylvicole.',
    partnerCivilTitle: 'Direction de la Protection Civile de la Wilaya',
    partnerCivilDesc: 'Sécurisation des intervenants et supervision des travaux de curage des lits d\'oueds pour prévenir les crues saisonnières.',
    partnerSecurityTitle: 'Services de la Sûreté, Gendarmerie et Santé Publique',
    partnerSecurityDesc: 'Animation d\'ateliers de sensibilisation contre les fléaux sociaux, sécurité routière et hygiène publique.',
    
    // Tips & Awareness Cards
    tipsTitle: 'Sécurité Opérationnelle & Bonnes Pratiques',
    tip1Title: 'Sécurité individuelle et équipements',
    tip1Desc: 'Port rigoureux de gants de manutention et de chaussures de sécurité. Interdiction formelle de manipuler le verre brisé à mains nues.',
    tip2Title: 'Tri sélectif à la source',
    tip2Desc: 'Isolement des fractions recyclables (plastiques rigides, cartons) dans des sacs dédiés pour faciliter leur valorisation industrielle.',
    tip3Title: 'Prescriptions de plantation en zone steppique',
    tip3Desc: 'Sélection rigoureuse des taxons résistants au gel et à la sécheresse, avec aménagement de cuvettes de rétention des eaux d\'impluvium.',
    
    // Feedback / Toasts
    toastReportSuccess: 'Le signalement a été enregistré avec succès et intégré au registre cartographique.',
    toastUpvoteSuccess: 'Merci pour votre confirmation ! Votre appui a été pris en compte pour rehausser la priorité.',
    toastJoinSuccess: 'Votre engagement pour cette opération a été validé.',
    toastCampaignSuccess: 'L\'opération a été publiée et ouverte à la mobilisation.',
    
    // Footer
    footerText: 'Plateforme Bayedha - Dispositif numérique d\'intérêt général au service du cadre de vie d\'El Bayadh.',
    footerCredits: 'Développé pour l\'engagement citoyen et la transition écologique en Algérie'
  }
};

window.i18n = i18n;
