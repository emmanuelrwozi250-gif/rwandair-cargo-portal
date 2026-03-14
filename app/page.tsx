import Link from 'next/link'
import { ArrowRight, Package, Shield, BarChart3, FileCheck, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-[#02284d] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-[#E4DC1F] rounded-lg flex items-center justify-center">
              <span className="text-[#02284d] font-bold text-xs">A</span>
            </div>
            <span className="font-bold text-white text-xl tracking-tight">ALTITUDE</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-blue-200 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#E4DC1F] text-[#02284d] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4cc10] transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#02284d] text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6 border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E4DC1F]"></span>
              Built for African Export SMEs
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              Manage your exports<br />
              <span className="text-[#E4DC1F]">with confidence.</span>
            </h1>
            <p className="text-lg text-blue-100 mb-10 leading-relaxed max-w-2xl">
              Altitude is the structured export workflow and cargo coordination platform
              for African SMEs. Manage shipments, handle documentation, and build a
              verified export history — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#E4DC1F] text-[#02284d] px-6 py-3.5 rounded-lg font-semibold text-base hover:bg-[#d4cc10] transition-colors"
              >
                Register as Exporter
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-6 py-3.5 rounded-lg font-semibold text-base hover:bg-white/20 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-[#011d3a] text-white py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '100+', label: 'Exporters Supported' },
            { value: '500+', label: 'Shipments Processed' },
            { value: '95%', label: 'Uptime Guarantee' },
            { value: '<3 min', label: 'Shipment Creation' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-[#E4DC1F]">{stat.value}</div>
              <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#02284d] mb-3">
              Everything you need to export
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              A complete platform purpose-built for African SME exporters — from
              documentation to cargo space coordination.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Package,
                title: 'Shipment Management',
                description:
                  'Create and track shipments from draft to delivery. Every shipment gets a unique ID and full audit trail.',
              },
              {
                icon: FileCheck,
                title: 'Document Handling',
                description:
                  'Upload and manage all export documents — invoices, packing lists, phytosanitary certificates — in one place.',
              },
              {
                icon: Shield,
                title: 'Cargo Coordination',
                description:
                  'Request air cargo space directly through the platform. Our team handles airline coordination on your behalf.',
              },
              {
                icon: BarChart3,
                title: 'Export Analytics',
                description:
                  'Track your total export volume, value, and on-time delivery rate. Build a verified export history over time.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#02284d]/20 hover:shadow-md transition-all"
              >
                <div className="h-10 w-10 bg-[#02284d]/8 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-[#02284d]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#02284d] mb-3">How it works</h2>
            <p className="text-gray-600">Get started in minutes. Our team verifies your account and you're ready to export.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Submit your company details and export license for verification.' },
              { step: '02', title: 'Get Approved', desc: 'Our team reviews your application within 24 hours.' },
              { step: '03', title: 'Create Shipments', desc: 'Add shipment details and upload your export documents.' },
              { step: '04', title: 'Request Cargo Space', desc: 'We coordinate airline space and confirm your booking.' },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-5 left-full w-full h-px bg-gray-200 z-0" style={{ width: 'calc(100% - 20px)', left: '50%' }} />
                )}
                <div className="relative">
                  <div className="h-10 w-10 bg-[#02284d] text-[#E4DC1F] rounded-full flex items-center justify-center text-sm font-bold mb-4 relative z-10">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#02284d]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your exports?
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Join African exporters who use Altitude to manage their cargo operations professionally.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#E4DC1F] text-[#02284d] px-8 py-3.5 rounded-lg font-semibold text-base hover:bg-[#d4cc10] transition-colors"
          >
            Start Your Application
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#011d3a] text-blue-300 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#E4DC1F] rounded flex items-center justify-center">
              <span className="text-[#02284d] font-bold text-[10px]">A</span>
            </div>
            <span className="text-white font-semibold text-sm">ALTITUDE</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Altitude Africa. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
