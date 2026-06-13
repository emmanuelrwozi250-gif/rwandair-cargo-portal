import type { Locale } from './types'

const t = {
  en: {
    // Navigation
    navQuote:        'Get a Quote',
    navConsolidate:  'Consolidate',
    navCapacity:     'Capacity',
    navDeals:        'Deals',
    navPerishables:  'Perishables',
    navCharter:      'Charter',
    navStations:     'Stations',
    navAgents:       'For Agents',
    navNews:         'News',
    ctaTrack:        'Track Shipment',
    ctaBook:         'Book Cargo',

    // Quote page
    quoteTitle:      'Instant Cargo Quote',
    quoteSubtitle:   'Enter your shipment details to get live pricing across three route options.',
    quoteOrigin:     'Origin',
    quoteDest:       'Destination',
    quoteWeight:     'Weight (kg)',
    quoteCommodity:  'Commodity Type',
    quoteBtn:        'Get instant quote',
    quoteLoading:    'Calculating…',

    // Product type names
    prodGeneral:     'General',
    prodFresh:       'Fresh',
    prodPharma:      'Pharma',
    prodValuables:   'Valuables',
    prodDG:          'Dangerous Goods',
    prodLive:        'Live Animals',

    // Page headings
    headPerishables: 'Perishables Command Center',
    headConsolidate: 'Consolidation Planner',
    headCharter:     'Charter the whole aircraft',
    headAgents:      'The cargo platform built for freight professionals',
    headStations:    'Cargo Station Directory',

    // Track
    trackTitle:      'Track your shipment',
    trackBtn:        'Track',

    // Common
    back:            'Back',
    loading:         'Loading…',
    error:           'Something went wrong',
    close:           'Close',
  },

  fr: {
    navQuote:        'Obtenir un devis',
    navConsolidate:  'Consolider',
    navCapacity:     'Capacité',
    navDeals:        'Offres',
    navPerishables:  'Périssables',
    navCharter:      'Affrètement',
    navStations:     'Stations',
    navAgents:       'Agents',
    navNews:         'Actualités',
    ctaTrack:        'Suivre un envoi',
    ctaBook:         'Réserver',

    quoteTitle:      'Devis cargo instantané',
    quoteSubtitle:   'Saisissez vos informations pour obtenir des tarifs en temps réel sur trois options.',
    quoteOrigin:     'Origine',
    quoteDest:       'Destination',
    quoteWeight:     'Poids (kg)',
    quoteCommodity:  'Type de marchandise',
    quoteBtn:        'Obtenir un devis',
    quoteLoading:    'Calcul en cours…',

    prodGeneral:     'Général',
    prodFresh:       'Frais',
    prodPharma:      'Pharma',
    prodValuables:   'Objets de valeur',
    prodDG:          'Marchandises dangereuses',
    prodLive:        'Animaux vivants',

    headPerishables: 'Centre de commande des périssables',
    headConsolidate: 'Planificateur de consolidation',
    headCharter:     'Affrétez l\'avion entier',
    headAgents:      'La plateforme cargo conçue pour les professionnels du fret',
    headStations:    'Répertoire des stations cargo',

    trackTitle:      'Suivre votre envoi',
    trackBtn:        'Rechercher',

    back:            'Retour',
    loading:         'Chargement…',
    error:           'Une erreur est survenue',
    close:           'Fermer',
  },

  ar: {
    navQuote:        'احصل على عرض أسعار',
    navConsolidate:  'دمج الشحنات',
    navCapacity:     'الطاقة الاستيعابية',
    navDeals:        'العروض',
    navPerishables:  'البضائع القابلة للتلف',
    navCharter:      'الشحن المستأجر',
    navStations:     'المحطات',
    navAgents:       'الوكلاء',
    navNews:         'الأخبار',
    ctaTrack:        'تتبع الشحنة',
    ctaBook:         'احجز الآن',

    quoteTitle:      'عرض أسعار فوري للشحن الجوي',
    quoteSubtitle:   'أدخل تفاصيل شحنتك للحصول على أسعار فورية عبر ثلاثة خيارات.',
    quoteOrigin:     'مطار الإقلاع',
    quoteDest:       'مطار الوصول',
    quoteWeight:     'الوزن (كجم)',
    quoteCommodity:  'نوع البضاعة',
    quoteBtn:        'احصل على عرض فوري',
    quoteLoading:    'جارٍ الحساب…',

    prodGeneral:     'بضائع عامة',
    prodFresh:       'بضائع طازجة',
    prodPharma:      'أدوية',
    prodValuables:   'بضائع ثمينة',
    prodDG:          'بضائع خطرة',
    prodLive:        'حيوانات حية',

    headPerishables: 'مركز قيادة البضائع القابلة للتلف',
    headConsolidate: 'مخطط دمج الشحنات',
    headCharter:     'استأجر الطائرة بالكامل',
    headAgents:      'منصة الشحن المصممة لمحترفي الشحن',
    headStations:    'دليل محطات الشحن',

    trackTitle:      'تتبع شحنتك',
    trackBtn:        'تتبع',

    back:            'رجوع',
    loading:         'جارٍ التحميل…',
    error:           'حدث خطأ ما',
    close:           'إغلاق',
  },
} as const

export type TranslationKey = keyof typeof t['en']

export const translations: Record<Locale, Record<TranslationKey, string>> = t
