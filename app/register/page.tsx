'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { EXPORT_CATEGORIES } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    company_name: '',
    business_registration_number: '',
    export_license_number: '',
    contact_person: '',
    email: '',
    phone: '',
    export_category: '',
    primary_export_destination: '',
    password: '',
    confirm_password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (!authData.user) {
        setError('Failed to create account. Please try again.')
        return
      }

      // Supabase returns a fake user with empty identities when the email is already registered
      // (email enumeration protection). Detect and handle this gracefully.
      if (authData.user.identities && authData.user.identities.length === 0) {
        setError('An account with this email already exists. Please sign in instead.')
        return
      }

      // Create the exporter profile via API route (uses service role)
      const response = await fetch('/api/exporters/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: authData.user.id,
          company_name: formData.company_name,
          business_registration_number: formData.business_registration_number,
          export_license_number: formData.export_license_number,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          export_category: formData.export_category,
          primary_export_destination: formData.primary_export_destination,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        setError(result.error || 'Registration failed. Please try again.')
        return
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Registration error:', err)
      setError('A network error occurred. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-[#02284d]">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="h-7 w-7 bg-[#E4DC1F] rounded-lg flex items-center justify-center">
                <span className="text-[#02284d] font-bold text-xs">A</span>
              </div>
              <span className="font-bold text-white text-lg tracking-tight">ALTITUDE</span>
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Application Submitted</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Your application has been submitted. You will be notified once approved.
                This usually takes 1–2 business days.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">Back to Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-[#02284d]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-[#E4DC1F] rounded-lg flex items-center justify-center">
              <span className="text-[#02284d] font-bold text-xs">A</span>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">ALTITUDE</span>
          </Link>
          <Link href="/login" className="text-sm text-blue-200 hover:text-white transition-colors">
            Already have an account? Sign In
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Register as Exporter</h1>
          <p className="text-gray-500 text-sm mt-1">
            Submit your company information for verification. You&apos;ll receive email confirmation once approved.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit}>
            {/* Company Information */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-[#02284d] uppercase tracking-wide mb-4">
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    id="company_name"
                    label="Company Name"
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="Acme Exports Ltd"
                    required
                  />
                </div>
                <Input
                  id="business_registration_number"
                  label="Business Registration Number"
                  value={formData.business_registration_number}
                  onChange={(e) => handleChange('business_registration_number', e.target.value)}
                  placeholder="BRN-123456"
                  required
                />
                <Input
                  id="export_license_number"
                  label="Export License Number"
                  value={formData.export_license_number}
                  onChange={(e) => handleChange('export_license_number', e.target.value)}
                  placeholder="EXP-789012"
                  required
                />
                <Select
                  id="export_category"
                  label="Export Category"
                  value={formData.export_category}
                  onChange={(e) => handleChange('export_category', e.target.value)}
                  options={EXPORT_CATEGORIES.map((c) => ({ value: c, label: c }))}
                  placeholder="Select category"
                  required
                />
                <Input
                  id="primary_export_destination"
                  label="Primary Export Destination"
                  value={formData.primary_export_destination}
                  onChange={(e) => handleChange('primary_export_destination', e.target.value)}
                  placeholder="e.g. Netherlands, UAE"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-[#02284d] uppercase tracking-wide mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    id="contact_person"
                    label="Contact Person (Full Name)"
                    value={formData.contact_person}
                    onChange={(e) => handleChange('contact_person', e.target.value)}
                    placeholder="Jane Kamau"
                    required
                  />
                </div>
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="jane@company.com"
                  required
                />
                <Input
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+254 700 123 456"
                  required
                />
              </div>
            </div>

            {/* Account Setup */}
            <div className="p-6">
              <h2 className="text-sm font-semibold text-[#02284d] uppercase tracking-wide mb-4">
                Account Password
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  helpText="Minimum 8 characters"
                />
                <Input
                  id="confirm_password"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => handleChange('confirm_password', e.target.value)}
                  placeholder="Repeat password"
                  required
                />
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-6">
                <Button type="submit" className="w-full" loading={loading} size="lg">
                  Submit Application
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                By registering, you confirm your business details are accurate.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
