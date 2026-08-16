// data.js - معطيات ميدانية نموذجية لمدينة البيض مصاغة بلغة رسمية وتقنية دقيقة
const INITIAL_DATA = {
  stats: {
    cleanedCount: 14,
    volunteersCount: 185,
    treesCount: 320,
    campaignsCount: 9
  },
  
  spots: [
    {
      id: 'spot-1',
      status: 'blackspot',
      category: 'waste',
      title: {
        ar: 'تراكم نفايات بلاستيكية وردام أشغال بمحاذاة المجرى المائي لوادي الفحم',
        fr: 'Accumulation de déchets plastiques et déblais le long du lit d\'Oued El Fahm'
      },
      neighbourhood: {
        ar: 'وادي الفحم - القطاع الشرقي',
        fr: 'Oued El Fahm - Secteur Est'
      },
      description: {
        ar: 'ترسبات معتبرة من الأكياس البلاستيكية العالقة بالنباتات الطبيعية مع مخلفات صلبة، مما يشكل عائقاً أمام الجريان السلس للمياه ومصدراً للتلوث البصري والبيئي.',
        fr: 'Dépôts importants de films plastiques enchevêtrés dans la végétation steppique et gravats inertes, entravant le libre écoulement des eaux pluviales.'
      },
      urgency: 'high',
      lat: 32.6945,
      lng: 1.0180,
      reportedAt: '2026-08-14',
      reportedBy: { ar: 'لجنة حي السلام', fr: 'Comité de Cité Essalam' },
      photo: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
      upvotes: 28
    },
    {
      id: 'spot-2',
      status: 'campaign',
      category: 'green',
      title: {
        ar: 'مبادرة التشجير والتهيئة البيئية للمدخل الغربي لبلدية البيض',
        fr: 'Opération de reboisement et réhabilitation environnementale de l\'entrée Ouest'
      },
      neighbourhood: {
        ar: 'طريق المشرية - المدخل الغربي',
        fr: 'Route de Mecheria - Entrée Ouest'
      },
      description: {
        ar: 'حملة تطوعية كبرى لغرس 80 شجيرة من الصنوبر الحلبي والبطم الأطلسي المعتمدة من محافظة الغابات، موازاة مع تنقية وتطهير الحواف.',
        fr: 'Action d\'envergure visant l\'implantation de 80 plants de Pin d\'Alep et Pistachier de l\'Atlas sous supervision sylvicole, couplée au décapage des accotements.'
      },
      urgency: 'medium',
      lat: 32.7082,
      lng: 1.0025,
      reportedAt: '2026-08-12',
      photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      campaignId: 'camp-1'
    },
    {
      id: 'spot-3',
      status: 'blackspot',
      category: 'infra',
      title: {
        ar: 'مفرغة فوضوية لمخلفات البناء والردام خلف المنشأة الرياضية الجوارية',
        fr: 'Dépôt sauvage de gravats de construction à l\'arrière du complexe sportif de proximité'
      },
      neighbourhood: {
        ar: 'حي المصالحة',
        fr: 'Cité El Moussalaha'
      },
      description: {
        ar: 'تكدس ركام خرساني وآجر ناتج عن أشغال فردية، يعرقل الولوج إلى الفضاء الترفيهي ويشوه النسيج العمراني للحي.',
        fr: 'Amas d\'inertes et débris de maçonnerie issus de chantiers diffus, obstruant les cheminements piétonniers et dégradant l\'esthétique urbaine.'
      },
      urgency: 'medium',
      lat: 32.7030,
      lng: 1.0250,
      reportedAt: '2026-08-15',
      reportedBy: { ar: 'ممثلو ساكنة حي المصالحة', fr: 'Représentants des riverains' },
      photo: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
      upvotes: 19
    },
    {
      id: 'spot-4',
      status: 'resolved',
      category: 'waste',
      title: {
        ar: 'استرجاع وتهيئة الساحة العمومية المحاذية للسوق المغطى بوسط المدينة',
        fr: 'Réhabilitation et mise en valeur de la place publique jouxtant le marché couvert'
      },
      neighbourhood: {
        ar: 'وسط المدينة - القطاع التجاري القديم',
        fr: 'Centre-ville - Secteur Commercial'
      },
      description: {
        ar: 'تم رفع أزيد من 4 أطنان من النفايات الهامشية، طلاء الأرصفة وتجديد ممرات المشاة وتثبيت حاويات جديدة بالتنسيق التام مع مصالح النظافة للبلدية.',
        fr: 'Évacuation de plus de 4 tonnes d\'encombrants, réfection de la peinture des bordures et implantation de réceptacles urbains normalisés.'
      },
      urgency: 'low',
      lat: 32.6990,
      lng: 1.0135,
      resolvedAt: '2026-08-08',
      cleanedBy: {
        ar: 'الكشافة الإسلامية الجزائرية (فوج الفلاح) بالتعاون مع عمال مصلحة النظافة لبلدية البيض',
        fr: 'Scouts Musulmans Algériens (Groupe El Fellah) en synergie avec les agents de salubrité de l\'APC'
      },
      beforePhoto: 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?w=800&auto=format&fit=crop&q=80',
      afterPhoto: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'spot-5',
      status: 'resolved',
      category: 'green',
      title: {
        ar: 'إعادة الاعتبار للحزام الأخضر المحيط بالمركز الجامعي نور البشير',
        fr: 'Restauration de la ceinture végétale périphérique du Centre Universitaire Nour Bachir'
      },
      neighbourhood: {
        ar: 'طريق سيدي بلعباس - الحرم الجامعي',
        fr: 'Route de Sidi Bel Abbès - Campus'
      },
      description: {
        ar: 'مبادرة طلابية وبيئية نموذجية لإزالة الأعشاب الطفيلية، غرس 50 شجيرة ظل وزينة، وتثبيت نظام ري بالتنقيط بالتنسيق مع إطارات محافظة الغابات.',
        fr: 'Opération pilote menée par le milieu estudiantin : désherbage mécanique, mise en terre de 50 essences adaptées et mise en service d\'une rampe d\'irrigation localisée.'
      },
      urgency: 'low',
      lat: 32.7150,
      lng: 1.0195,
      resolvedAt: '2026-07-28',
      cleanedBy: {
        ar: 'النادي العلمي للبيئة والتنمية المستدامة بالاشتراك مع محافظة الغابات لولاية البيض',
        fr: 'Club Scientifique Universitaire en partenariat avec la Conservation des Forêts'
      },
      beforePhoto: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
      afterPhoto: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80'
    }
  ],
  
  campaigns: [
    {
      id: 'camp-1',
      title: {
        ar: 'حملة التويزة الكبرى: تنظيف وتشجير الحزام الغربي لمدينة البيض',
        fr: 'Grande Touiza : Assainissement et reboisement de la ceinture Ouest d\'El Bayadh'
      },
      type: 'tree',
      date: 'الجمعة 21 أوت 2026 - 08:00 صباحاً',
      dateIso: '2026-08-21T08:00:00',
      meetingPoint: {
        ar: 'مفترق الطرق المؤدي إلى المشرية (المعلم التذكاري)',
        fr: 'Intersection Route de Mecheria (Monument commémoratif)'
      },
      organizer: {
        ar: 'فوج الفلاح للكشافة الإسلامية الجزائرية بالتنسيق مع محافظة الغابات وبلدية البيض',
        fr: 'Scouts SMA (Groupe El Fellah) en coordination avec la Conservation des Forêts et l\'APC'
      },
      target: {
        ar: 'غرس 80 شجيرة صنوبر حلبي مع تعبئة وجمع ما يزيد عن 200 كيس من المخلفات الصلبة والبلاستيكية',
        fr: 'Plantation de 80 résineux steppiques et évacuation de 200 sacs de résidus plastiques'
      },
      toolsNeeded: {
        ar: ['قفازات واقية متينة', 'أكياس جمع سعة 100 لتر', 'مجارف وفؤوس غرس', 'صهريج مياه للسقي', 'شاحنة تابعة للبلدية لنقل المخلفات'],
        fr: ['Gants de protection renforcés', 'Sacs étanches 100L', 'Outillage de terrassement', 'Citerne d\'arrosage', 'Benne communale']
      },
      volunteersRegistered: 34,
      isUserJoined: false,
      banner: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'camp-2',
      title: {
        ar: 'العملية الوقائية الاستباقية: تنقية وتطهير مجرى وادي الفحم تحسباً لموسم الأمطار',
        fr: 'Dispositif préventif : Curage hydro-technique et dégagement du lit d\'Oued El Fahm'
      },
      type: 'wadi',
      date: 'السبت 22 أوت 2026 - 07:30 صباحاً',
      dateIso: '2026-08-22T07:30:00',
      meetingPoint: {
        ar: 'محاذاة المنشأة الفنية (جسر حي السلام)',
        fr: 'Ouvrage d\'art (Pont de Cité Essalam)'
      },
      organizer: {
        ar: 'لجنة حي السلام بالتنسيق الفني مع وحدة الحماية المدنية لولاية البيض',
        fr: 'Comité de quartier Essalam sous encadrement technique de la Protection Civile'
      },
      target: {
        ar: 'رفع كافة العوائق الصلبة والترسبات من مجرى الوادي لتأمين تصريف مياه السيول والوقاية من الفيضانات',
        fr: 'Éradication des embâcles et sédiments pour garantir le gabarit hydraulique d\'écoulement'
      },
      toolsNeeded: {
        ar: ['أحذية مطاطية عازلة', 'مجارف معدنية صلبة', 'حبال سحب ميكانيكية', 'شاحنة ذات رافعة لمصالح البلدية'],
        fr: ['Bottes de sécurité hautes', 'Pelles de curage', 'Élingues de traction', 'Camion-benne hydrocureur']
      },
      volunteersRegistered: 26,
      isUserJoined: false,
      banner: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'camp-3',
      title: {
        ar: 'مبادرة التهيئة الحضرية: طلاء حواف الأرصفة وجداريات التوعية البيئية',
        fr: 'Opération d\'embellissement urbain : Peinture des bordures et fresques citoyennes'
      },
      type: 'paint',
      date: 'الجمعة 28 أوت 2026 - 08:30 صباحاً',
      dateIso: '2026-08-28T08:30:00',
      meetingPoint: {
        ar: 'الفضاء العمومي المركزي لحي المصالحة',
        fr: 'Esplanade centrale de Cité El Moussalaha'
      },
      organizer: {
        ar: 'جمعية إطارات وشباب البيض وممثلو ساكنة الحي',
        fr: 'Association des Cadres et Jeunes d\'El Bayadh avec les résidents'
      },
      target: {
        ar: 'إعادة طلاء 500 متر طولي من حواف الأرصفة وإنجاز جداريات تحسيسية حول ترشيد النظافة',
        fr: 'Mise en peinture de 500 mètres linéaires de trottoirs et fresques de sensibilisation éco-citoyenne'
      },
      toolsNeeded: {
        ar: ['فراشي وأسطوانات طلاء', 'دهان خارجي مقاوم للعوامل الجوية', 'أشرطة تحديد لاصقة'],
        fr: ['Rouleaux et pinceaux professionnels', 'Peinture routière et pigments minéraux', 'Rubans de masquage']
      },
      volunteersRegistered: 19,
      isUserJoined: false,
      banner: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80'
    }
  ]
};

window.INITIAL_DATA = INITIAL_DATA;
