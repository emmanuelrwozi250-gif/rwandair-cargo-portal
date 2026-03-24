import type { Locale } from './types'

const t = {
  en: {
    // Navbar
    navGetQuote:     'Get Quote',
    navConsolidate:  'Consolidate',
    navCapacity:     'Capacity',
    navDeals:        'Last-min Deals',
    navTrack:        'Track',
    navAgent:        'AI Agent',
    navMyShipments:  'My Shipments',
    navBookNow:      'Book Now',

    // Hero
    heroTitle:       'Connecting Africa to the World',
    heroSubtitle:    'And the World to Africa. Real-time routing, consolidation intelligence, and perishables expertise — with Kigali as Africa\'s gateway.',
    heroCta:         'Get Instant Quote',
    heroCtaTrack:    'Track Shipment',

    // Quote page
    quoteTitle:      'Instant Cargo Quote',
    quoteSubtitle:   'Enter your shipment details to get live pricing across three route options.',
    quoteOrigin:     'Origin',
    quoteDest:       'Destination',
    quoteWeight:     'Weight (kg)',
    quoteCommodity:  'Commodity Type',
    quoteBtn:        'Get Quote →',
    quoteLoading:    'Calculating…',

    // Track
    trackTitle:      'Track your shipment',
    trackSubtitle:   'Enter your Air Waybill (AWB) number to get live status.',
    trackBtn:        'Track',
    trackPlaceholder:'e.g. 459-40100001',

    // Deals
    dealsTitle:      'Last-Minute Deals',
    dealsSubtitle:   'Discounted empty belly space on tonight\'s departures — offers expire fast.',
    dealsGrab:       'Grab this space →',
    dealsExpired:    'Offer expired',

    // Capacity
    capacityTitle:   'Live Freighter Capacity',
    capacitySubtitle:'Real-time belly space across the WB freighter network.',
    capacityRefresh: 'Refresh',

    // Footer
    footerTagline:   'Fly the Dream of Africa',
    footerRights:    '© 2025 RwandAir Ltd. All rights reserved.',

    // Common
    back:            'Back',
    loading:         'Loading…',
    error:           'Something went wrong',
    close:           'Close',
  },

  fr: {
    navGetQuote:     'Obtenir un devis',
    navConsolidate:  'Consolider',
    navCapacity:     'Capacité',
    navDeals:        'Offres du moment',
    navTrack:        'Suivre',
    navAgent:        'Agent IA',
    navMyShipments:  'Mes Envois',
    navBookNow:      'Réserver',

    heroTitle:       "Connecter l'Afrique au Monde",
    heroSubtitle:    "Et le Monde à l'Afrique. Routage en temps réel, consolidation intelligente et expertise périssables — avec Kigali comme porte d'entrée de l'Afrique.",
    heroCta:         'Devis instantané',
    heroCtaTrack:    'Suivre un envoi',

    quoteTitle:      'Devis cargo instantané',
    quoteSubtitle:   'Saisissez vos informations pour obtenir des tarifs en temps réel.',
    quoteOrigin:     'Origine',
    quoteDest:       'Destination',
    quoteWeight:     'Poids (kg)',
    quoteCommodity:  'Type de marchandise',
    quoteBtn:        'Obtenir un devis →',
    quoteLoading:    'Calcul en cours…',

    trackTitle:      'Suivre votre envoi',
    trackSubtitle:   'Saisissez votre numéro de lettre de transport aérien (LTA).',
    trackBtn:        'Rechercher',
    trackPlaceholder:'ex. 459-40100001',

    dealsTitle:      'Offres de dernière minute',
    dealsSubtitle:   'Espaces disponibles à prix réduit sur les départs de ce soir.',
    dealsGrab:       'Réserver cet espace →',
    dealsExpired:    'Offre expirée',

    capacityTitle:   'Capacité cargo en direct',
    capacitySubtitle:'Espace ventre disponible en temps réel sur le réseau fréteur WB.',
    capacityRefresh: 'Actualiser',

    footerTagline:   'Vivez le rêve de l\'Afrique',
    footerRights:    '© 2025 RwandAir Ltd. Tous droits réservés.',

    back:            'Retour',
    loading:         'Chargement…',
    error:           'Une erreur est survenue',
    close:           'Fermer',
  },

  ar: {
    navGetQuote:     'احصل على عرض أسعار',
    navConsolidate:  'دمج الشحنات',
    navCapacity:     'الطاقة الاستيعابية',
    navDeals:        'عروض اللحظة الأخيرة',
    navTrack:        'تتبع الشحنة',
    navAgent:        'الذكاء الاصطناعي',
    navMyShipments:  'شحناتي',
    navBookNow:      'احجز الآن',

    heroTitle:       'نربط أفريقيا بالعالم',
    heroSubtitle:    'والعالم بأفريقيا. توجيه في الوقت الفعلي، ذكاء التوحيد، وخبرة البضائع المبردة — مع كيغالي بوابةً لأفريقيا.',
    heroCta:         'احصل على عرض فوري',
    heroCtaTrack:    'تتبع الشحنة',

    quoteTitle:      'عرض أسعار فوري للشحن الجوي',
    quoteSubtitle:   'أدخل تفاصيل شحنتك للحصول على أسعار فورية.',
    quoteOrigin:     'مطار الإقلاع',
    quoteDest:       'مطار الوصول',
    quoteWeight:     'الوزن (كجم)',
    quoteCommodity:  'نوع البضاعة',
    quoteBtn:        'احصل على عرض ←',
    quoteLoading:    'جارٍ الحساب…',

    trackTitle:      'تتبع شحنتك',
    trackSubtitle:   'أدخل رقم بوليصة الشحن الجوي للحصول على الحالة الفورية.',
    trackBtn:        'تتبع',
    trackPlaceholder:'مثال: 459-40100001',

    dealsTitle:      'عروض اللحظة الأخيرة',
    dealsSubtitle:   'أماكن شحن متاحة بأسعار مخفضة على رحلات الليلة — العروض تنتهي بسرعة.',
    dealsGrab:       '← احجز هذا المكان',
    dealsExpired:    'انتهت صلاحية العرض',

    capacityTitle:   'طاقة الشحن الجوي المباشر',
    capacitySubtitle:'الطاقة الاستيعابية الفورية عبر شبكة الشحن الجوي WB.',
    capacityRefresh: 'تحديث',

    footerTagline:   'اعش حلم أفريقيا',
    footerRights:    '© 2025 رواند إير. جميع الحقوق محفوظة.',

    back:            'رجوع',
    loading:         'جارٍ التحميل…',
    error:           'حدث خطأ ما',
    close:           'إغلاق',
  },

  sw: {
    navGetQuote:     'Pata Bei',
    navConsolidate:  'Unganisha',
    navCapacity:     'Uwezo',
    navDeals:        'Ofa za Haraka',
    navTrack:        'Fuatilia',
    navAgent:        'Wakala wa AI',
    navMyShipments:  'Mizigo Yangu',
    navBookNow:      'Weka Nafasi',

    heroTitle:       'Kuunganisha Afrika na Dunia',
    heroSubtitle:    'Na Dunia na Afrika. Mwelekeo wa wakati halisi, akili ya uunganishaji, na utaalamu wa bidhaa zinazoharibu — na Kigali kama lango la Afrika.',
    heroCta:         'Pata Bei ya Haraka',
    heroCtaTrack:    'Fuatilia Mzigo',

    quoteTitle:      'Bei ya Haraka ya Mzigo',
    quoteSubtitle:   'Ingiza maelezo ya mzigo wako kupata bei za sasa hivi.',
    quoteOrigin:     'Chanzo',
    quoteDest:       'Lengwa',
    quoteWeight:     'Uzito (kg)',
    quoteCommodity:  'Aina ya Bidhaa',
    quoteBtn:        'Pata Bei →',
    quoteLoading:    'Inakokotoa…',

    trackTitle:      'Fuatilia mzigo wako',
    trackSubtitle:   'Ingiza nambari yako ya AWB kupata hali ya sasa.',
    trackBtn:        'Fuatilia',
    trackPlaceholder:'mfano 459-40100001',

    dealsTitle:      'Ofa za Dakika ya Mwisho',
    dealsSubtitle:   'Nafasi za mzigo zilizopunguzwa kwenye ndege za usiku wa leo.',
    dealsGrab:       'Chukua nafasi hii →',
    dealsExpired:    'Ofa imeisha',

    capacityTitle:   'Uwezo wa Moja kwa Moja',
    capacitySubtitle:'Nafasi za mzigo kwa wakati halisi kwenye mtandao wa WB.',
    capacityRefresh: 'Sasisha',

    footerTagline:   'Ruka Ndoto ya Afrika',
    footerRights:    '© 2025 RwandAir Ltd. Haki zote zimehifadhiwa.',

    back:            'Rudi',
    loading:         'Inapakia…',
    error:           'Hitilafu imetokea',
    close:           'Funga',
  },

  zh: {
    navGetQuote:     '获取报价',
    navConsolidate:  '拼箱服务',
    navCapacity:     '运力查询',
    navDeals:        '特价优惠',
    navTrack:        '货物追踪',
    navAgent:        'AI助手',
    navMyShipments:  '我的货物',
    navBookNow:      '立即预订',

    heroTitle:       '连接非洲与世界',
    heroSubtitle:    '也连接世界与非洲。实时路由规划、整合智能化和易腐品专业服务——以基加利为非洲通向世界的门户。',
    heroCta:         '立即获取报价',
    heroCtaTrack:    '追踪货物',

    quoteTitle:      '即时货运报价',
    quoteSubtitle:   '输入您的货物信息，获取三条路线的实时报价。',
    quoteOrigin:     '出发地',
    quoteDest:       '目的地',
    quoteWeight:     '重量（千克）',
    quoteCommodity:  '货物类型',
    quoteBtn:        '获取报价 →',
    quoteLoading:    '计算中…',

    trackTitle:      '追踪您的货物',
    trackSubtitle:   '输入航空运单号（AWB）获取实时状态。',
    trackBtn:        '追踪',
    trackPlaceholder:'例如 459-40100001',

    dealsTitle:      '特价优惠',
    dealsSubtitle:   '今晚出发航班的折扣舱位——优惠随时截止。',
    dealsGrab:       '抢占舱位 →',
    dealsExpired:    '优惠已过期',

    capacityTitle:   '实时运力查询',
    capacitySubtitle:'WB货运网络的实时腹舱可用空间。',
    capacityRefresh: '刷新',

    footerTagline:   '飞翔非洲之梦',
    footerRights:    '© 2025 卢旺达航空有限公司。保留所有权利。',

    back:            '返回',
    loading:         '加载中…',
    error:           '出现错误',
    close:           '关闭',
  },

  hi: {
    navGetQuote:     'कोटेशन प्राप्त करें',
    navConsolidate:  'कंसोलिडेट',
    navCapacity:     'क्षमता',
    navDeals:        'अंतिम क्षण सौदे',
    navTrack:        'ट्रैक करें',
    navAgent:        'AI एजेंट',
    navMyShipments:  'मेरी शिपमेंट',
    navBookNow:      'अभी बुक करें',

    heroTitle:       'अफ्रीका को विश्व से जोड़ना',
    heroSubtitle:    'और विश्व को अफ्रीका से। वास्तविक समय रूटिंग, कंसोलिडेशन इंटेलिजेंस और पेरिशेबल्स विशेषज्ञता — किगाली को अफ्रीका के प्रवेश द्वार के रूप में।',
    heroCta:         'तुरंत कोटेशन प्राप्त करें',
    heroCtaTrack:    'शिपमेंट ट्रैक करें',

    quoteTitle:      'तत्काल कार्गो कोटेशन',
    quoteSubtitle:   'तीन रूट विकल्पों पर लाइव मूल्य निर्धारण के लिए विवरण दर्ज करें।',
    quoteOrigin:     'उत्पत्ति स्थान',
    quoteDest:       'गंतव्य',
    quoteWeight:     'वजन (किग्रा)',
    quoteCommodity:  'वस्तु का प्रकार',
    quoteBtn:        'कोटेशन प्राप्त करें →',
    quoteLoading:    'गणना हो रही है…',

    trackTitle:      'अपनी शिपमेंट ट्रैक करें',
    trackSubtitle:   'लाइव स्थिति के लिए अपना AWB नंबर दर्ज करें।',
    trackBtn:        'ट्रैक करें',
    trackPlaceholder:'जैसे 459-40100001',

    dealsTitle:      'अंतिम क्षण सौदे',
    dealsSubtitle:   'आज रात की उड़ानों पर रियायती खाली जगह — ऑफर जल्दी समाप्त होते हैं।',
    dealsGrab:       'यह स्थान लें →',
    dealsExpired:    'ऑफर समाप्त हो गया',

    capacityTitle:   'लाइव फ्रेटर क्षमता',
    capacitySubtitle:'WB फ्रेटर नेटवर्क पर रियल-टाइम बेली स्पेस।',
    capacityRefresh: 'रिफ्रेश',

    footerTagline:   'अफ्रीका का सपना उड़ाओ',
    footerRights:    '© 2025 RwandAir Ltd. सर्वाधिकार सुरक्षित।',

    back:            'वापस',
    loading:         'लोड हो रहा है…',
    error:           'कुछ गलत हो गया',
    close:           'बंद करें',
  },
} as const

export type TranslationKey = keyof typeof t['en']
export const translations: Record<Locale, Record<TranslationKey, string>> = t
