import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AgentRegisterForm from '@/components/agents/AgentRegisterForm'

export const metadata: Metadata = {
  title: 'Apply for Agent Access',
  description:
    'Register your freight agency with RwandAir Cargo: allocations, credit terms, priority booking and API access. Response within 24 hours.',
  alternates: { canonical: '/agents/register' },
}

export default function AgentRegisterPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>
        <div className="py-14" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Agent onboarding</p>
            <h1 className="text-white mb-3" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800 }}>
              Apply for agent access
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
              Takes 2 minutes. Our commercial team will contact you within 24 hours.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
            <AgentRegisterForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
