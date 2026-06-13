import Link from 'next/link'
import RwandaLandscape from '@/components/brand/RwandaLandscape'
import { Globe, MessageCircle, Phone, Mail, MapPin } from 'lucide-react'
import RwandAirCargoLogo from '@/components/brand/RwandAirCargoLogo'
import FeedbackDrawer from '@/components/feedback/FeedbackDrawer'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: 'var(--wb-gray-900)' }}>
      {/* Landscape silhouette transition */}
      <div className="w-full" style={{ marginBottom: '-2px' }}>
        <RwandaLandscape baseColor="#00529C" />
      </div>

      <div style={{ background: 'var(--brand-blue)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10">

            {/* Brand col */}
            <div className="md:col-span-1">
              <div className="mb-1">
                <RwandAirCargoLogo size={56} />
              </div>
              <p className="text-xs italic mb-4 mt-2" style={{ color: 'rgba(242,222,14,0.7)' }}>
                Built to Move Africa
              </p>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                From Africa, for the world — real-time routing, cold-chain precision, and African cargo expertise. Moving from Kigali, tonight.
              </p>

              {/* Award badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                   style={{ background: 'rgba(242,222,14,0.1)', border: '1px solid rgba(242,222,14,0.25)' }}>
                <span className="text-xs" style={{ color: 'var(--wb-yellow)' }}>🏆</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--wb-yellow)' }}>
                  Top-Rated African Cargo Carrier · 2025
                </span>
              </div>

              <div className="flex gap-3">
                <a href="https://www.rwandair.com" target="_blank" rel="noopener noreferrer"
                   aria-label="Visit RwandAir official website"
                   className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <Globe className="w-4 h-4" style={{ color: 'var(--wb-sky)' }} />
                </a>
                <a href="https://wa.me/250788177000"
                   aria-label="Contact us on WhatsApp"
                   className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <MessageCircle className="w-4 h-4" style={{ color: '#25D366' }} />
                </a>
                <a href="tel:+250788177000"
                   aria-label="Call RwandAir Cargo desk"
                   className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <Phone className="w-4 h-4" style={{ color: 'var(--wb-sky)' }} />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="label-upper mb-4" style={{ color: 'var(--wb-sky)' }}>Services</p>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {[
                  ['Get a Quote', '/quote'],
                  ['Perishables', '/perishables'],
                  ['Live Capacity', '/capacity'],
                  ['Charter', '/charter'],
                  ['Cargo Stations', '/stations'],
                  ['File a Claim', '/claims'],
                  ['Rate our Services', '/reviews'],
                  ['Feedback', '/feedback'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust & Support */}
            <div>
              <p className="label-upper mb-4" style={{ color: 'var(--wb-sky)' }}>Trust &amp; Support</p>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {[
                  ['Claims Process', '/claims'],
                  ['Service Guarantee', '/legal/service-guarantee'],
                  ['Reviews', '/reviews'],
                  ['Feedback', '/feedback'],
                  ['News & Updates', '/news'],
                ].map(([label, href]) => (
                  <li key={`${href}-${label}`}>
                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Routes */}
            <div>
              <p className="label-upper mb-4" style={{ color: 'var(--wb-sky)' }}>Key Routes</p>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {[
                  'KGL → London (LHR)',
                  'KGL → Paris (CDG / BRU)',
                  'KGL → Dubai (DXB / DWC)',
                  'KGL → Sharjah (SHJ) ✈ Freighter',
                  'KGL → Djibouti (JIB) ✈ Freighter',
                  'KGL → Lagos (LOS)',
                  'KGL → Nairobi (NBO)',
                  'KGL → Johannesburg (JNB)',
                  'EBB / DAR → KGL → Europe',
                ].map(r => <li key={r}>{r}</li>)}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="label-upper mb-4" style={{ color: 'var(--wb-sky)' }}>Contact Cargo</p>
              <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <li>
                  <Link href="/track" className="hover:text-white transition-colors">Track Shipment</Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">Client Portal</Link>
                </li>
              </ul>

              {/* Cargo contact card */}
              <div className="mt-4 p-4 rounded-lg space-y-2"
                   style={{ background: 'rgba(242,222,14,0.08)', border: '1px solid rgba(242,222,14,0.2)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--wb-yellow)' }}>24/7 Cargo Desk</p>
                <a href="tel:+250788177000"
                   className="flex items-center gap-1.5 text-sm font-bold text-white hover:opacity-80 transition-opacity">
                  <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--wb-yellow)' }} />
                  +250 788 177 000
                </a>
                <a href="tel:+250738306074"
                   className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
                   style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <Phone className="w-3 h-3 shrink-0" />
                  +250 738 306 074
                </a>
                <a href="mailto:cargo@rwandair.com"
                   className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
                   style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <Mail className="w-3 h-3 shrink-0" />
                  cargo@rwandair.com
                </a>
                <a href="mailto:cargobooking@rwandair.com"
                   className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
                   style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <Mail className="w-3 h-3 shrink-0" />
                  cargobooking@rwandair.com
                </a>
                <div className="flex items-start gap-1.5 text-xs"
                     style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>Kigali International Airport, Main Building (top floor)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform integrations — single line replacing duplicate strip */}
          <div className="mt-10 pt-6 flex flex-wrap items-center gap-4"
               style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Link href="/integrations" className="hover:text-white transition-colors underline underline-offset-2">
                Book via all major platforms
              </Link>
              {' '}— cargo.one, WebCargo, CargoAi, Flexport &amp; more
            </p>
          </div>

          {/* Certifications strip */}
          <div className="mt-4 pt-4 flex flex-wrap items-center gap-4"
               style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs mr-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Certified &amp; accredited:</p>
            {['IATA Member', 'IOSA Certified', 'EASA Approved', 'ISAGO Certified', 'APEX Diamond Health Safety'].map(cert => (
              <span key={cert}
                    className="px-2.5 py-1 rounded text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {cert}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              © {new Date().getFullYear()} RwandAir Limited. All rights reserved. Kigali, Rwanda.
            </p>
            <div className="flex items-center gap-5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <FeedbackDrawer />
              <a href="https://www.rwandair.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy</a>
              <a href="https://www.rwandair.com/terms-conditions" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms</a>
              <a href="https://www.rwandair.com/gdpr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GDPR</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
