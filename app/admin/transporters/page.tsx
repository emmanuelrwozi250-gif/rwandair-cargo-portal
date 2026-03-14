'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import TopBar from '@/components/dashboard/TopBar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Transporter } from '@/types'
import { Loader2, Plus, Star } from 'lucide-react'

export default function AdminTransportersPage() {
  const [transporters, setTransporters] = useState<Transporter[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransporter, setEditingTransporter] = useState<Transporter | null>(null)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const emptyForm = {
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    city: '',
    country: '',
    vehicle_types: '',
    max_weight_kg: '',
    admin_notes: '',
  }
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    loadTransporters()
  }, [])

  const loadTransporters = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/transporters')
    if (res.ok) {
      const data = await res.json()
      setTransporters(data.transporters || [])
    }
    setLoading(false)
  }

  const openAddModal = () => {
    setEditingTransporter(null)
    setFormData(emptyForm)
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (t: Transporter) => {
    setEditingTransporter(t)
    setFormData({
      company_name: t.company_name,
      contact_person: t.contact_person,
      phone: t.phone,
      email: t.email || '',
      city: t.city,
      country: t.country,
      vehicle_types: (t.vehicle_types || []).join(', '),
      max_weight_kg: t.max_weight_kg ? String(t.max_weight_kg) : '',
      admin_notes: t.admin_notes || '',
    })
    setFormError('')
    setShowModal(true)
  }

  const handleDeactivate = async (t: Transporter) => {
    if (!confirm(`Deactivate ${t.company_name}?`)) return
    await fetch(`/api/admin/transporters/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: false }),
    })
    loadTransporters()
  }

  const handleActivate = async (t: Transporter) => {
    await fetch(`/api/admin/transporters/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: true }),
    })
    loadTransporters()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    const payload = {
      company_name: formData.company_name,
      contact_person: formData.contact_person,
      phone: formData.phone,
      email: formData.email || undefined,
      city: formData.city,
      country: formData.country,
      vehicle_types: formData.vehicle_types
        ? formData.vehicle_types.split(',').map((v) => v.trim()).filter(Boolean)
        : undefined,
      max_weight_kg: formData.max_weight_kg || undefined,
      admin_notes: formData.admin_notes || undefined,
    }

    try {
      const url = editingTransporter
        ? `/api/admin/transporters/${editingTransporter.id}`
        : '/api/admin/transporters'
      const method = editingTransporter ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || 'Failed to save transporter')
        return
      }

      setShowModal(false)
      loadTransporters()
    } finally {
      setFormLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <TopBar
        title="Transporters"
        subtitle="Manage last-mile cargo pickup partners"
        actions={
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Transporter
          </Button>
        }
      />

      <div className="p-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-[#02284d]" />
            </div>
          ) : transporters.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm mb-3">No transporters yet</p>
              <Button variant="outline" onClick={openAddModal}>Add your first transporter</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Company', 'City', 'Country', 'Vehicles', 'Max Weight', 'Pickups', 'On-Time', 'Rating', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transporters.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{t.company_name}</p>
                        <p className="text-xs text-gray-500">{t.contact_person} · {t.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{t.city}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{t.country}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[120px] truncate">
                        {(t.vehicle_types || []).join(', ') || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {t.max_weight_kg ? `${Number(t.max_weight_kg).toLocaleString()} kg` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{t.total_pickups}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {t.on_time_rate ? `${Number(t.on_time_rate).toFixed(0)}%` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          {t.rating ? Number(t.rating).toFixed(1) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          t.is_active
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {t.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openEditModal(t)}
                            className="text-xs font-medium text-[#02284d] hover:underline"
                          >
                            Edit
                          </button>
                          {t.is_active ? (
                            <button
                              onClick={() => handleDeactivate(t)}
                              className="text-xs font-medium text-red-500 hover:underline"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(t)}
                              className="text-xs font-medium text-green-600 hover:underline"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {editingTransporter ? 'Edit Transporter' : 'Add Transporter'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Input
                    id="company_name"
                    label="Company Name"
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    required
                  />
                </div>
                <Input
                  id="contact_person"
                  label="Contact Person"
                  value={formData.contact_person}
                  onChange={(e) => handleChange('contact_person', e.target.value)}
                  required
                />
                <Input
                  id="phone"
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
                <div className="col-span-2">
                  <Input
                    id="email"
                    label="Email (optional)"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <Input
                  id="city"
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
                <Input
                  id="country"
                  label="Country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  required
                />
                <div className="col-span-2">
                  <Input
                    id="vehicle_types"
                    label="Vehicle Types (comma-separated)"
                    value={formData.vehicle_types}
                    onChange={(e) => handleChange('vehicle_types', e.target.value)}
                    placeholder="e.g. Truck, Van, Pickup"
                  />
                </div>
                <Input
                  id="max_weight_kg"
                  label="Max Weight (kg)"
                  type="number"
                  value={formData.max_weight_kg}
                  onChange={(e) => handleChange('max_weight_kg', e.target.value)}
                  placeholder="e.g. 5000"
                />
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Notes</label>
                  <textarea
                    value={formData.admin_notes}
                    onChange={(e) => handleChange('admin_notes', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#02284d] resize-none h-16"
                  />
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={formLoading}>
                  {editingTransporter ? 'Save Changes' : 'Add Transporter'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
