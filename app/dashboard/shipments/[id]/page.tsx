'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import TopBar from '@/components/dashboard/TopBar'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import StatusTimeline from '@/components/shipments/StatusTimeline'
import DocumentUpload from '@/components/documents/DocumentUpload'
import PortCutoffBanner from '@/components/shipments/PortCutoffBanner'
import PickupRequestForm from '@/components/pickups/PickupRequestForm'
import PickupStatusCard from '@/components/pickups/PickupStatusCard'
import PickupCutoffBanner from '@/components/pickups/PickupCutoffBanner'
import { Shipment, Document, StatusLog, PickupRequest } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ArrowLeft, Package, Loader2, Waves } from 'lucide-react'

export default function ShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const shipmentId = params.id as string

  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([])
  const [pickup, setPickup] = useState<PickupRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showPickupForm, setShowPickupForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [shipmentId])

  const loadData = async () => {
    setLoading(true)

    const [shipmentRes, docsRes, logsRes] = await Promise.all([
      supabase.from('shipments').select('*').eq('id', shipmentId).single(),
      supabase.from('documents').select('*').eq('shipment_id', shipmentId).order('uploaded_at'),
      supabase
        .from('status_logs')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('changed_at'),
    ])

    if (shipmentRes.data) setShipment(shipmentRes.data as Shipment)
    if (docsRes.data) setDocuments(docsRes.data as Document[])
    if (logsRes.data) setStatusLogs(logsRes.data as StatusLog[])

    // Load pickup
    const pickupRes = await fetch(`/api/pickups?shipment_id=${shipmentId}`)
    if (pickupRes.ok) {
      const pickupData = await pickupRes.json()
      setPickup(pickupData.pickup || null)
    }

    setLoading(false)
  }

  const handleRequestBooking = async () => {
    setBookingLoading(true)
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: 'Booking Requested' }),
      })

      if (response.ok) {
        setBookingSuccess(true)
        loadData()
      }
    } finally {
      setBookingLoading(false)
    }
  }

  const handleDocumentUpload = (doc: Document) => {
    setDocuments((prev) => [...prev, doc])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#02284d]" />
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Shipment not found</p>
        <Link href="/dashboard" className="text-[#02284d] text-sm mt-2 inline-block hover:underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const canRequestBooking = ['Draft', 'Documents Pending'].includes(shipment.status)
  const hasRequestedBooking = !['Draft', 'Documents Pending'].includes(shipment.status)
  const isDraft = shipment.status === 'Draft'
  const isWater = shipment.transport_mode === 'water'
  const canRequestPickup = ['Draft', 'Documents Pending', 'Booking Requested'].includes(shipment.status)

  // Document completion for port cutoff
  const requiredDocsCount = isWater
    ? (shipment.water_type === 'inland_lake' ? 5 : 6)
    : 3
  const uploadedRequired = documents.filter((d) => {
    if (isWater && shipment.water_type === 'inland_lake') {
      return ['Commercial Invoice', 'Inland Waterway Bill', 'Cargo Manifest', 'Packing List', 'Export License'].includes(d.document_type)
    }
    if (isWater) {
      return ['Commercial Invoice', 'Bill of Lading', 'Certificate of Origin', 'Packing List', 'Vessel Booking Confirmation', 'Export License'].includes(d.document_type)
    }
    return ['Commercial Invoice', 'Packing List', 'Export License'].includes(d.document_type)
  }).length
  const documentsComplete = uploadedRequired >= requiredDocsCount

  // Destination display
  const destinationDisplay = isWater
    ? (shipment.port_of_discharge
        ? `${shipment.destination_country} (${shipment.port_of_discharge})`
        : shipment.destination_country)
    : `${shipment.destination_country}${shipment.destination_airport ? ` (${shipment.destination_airport})` : ''}`

  return (
    <div>
      <TopBar
        title={shipment.shipment_id}
        subtitle={shipment.product_type}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={shipment.status} />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-6 max-w-4xl">
        {/* Port Cutoff Banner */}
        {isWater && (shipment.water_type === 'ocean' || shipment.water_type === 'coastal') && (
          <PortCutoffBanner
            portCutoffDate={shipment.port_cutoff_date || null}
            documentsComplete={documentsComplete}
          />
        )}

        {/* Pickup Cutoff Banner */}
        {!pickup && (
          <PickupCutoffBanner
            shipment={shipment}
            onRequestPickup={() => setShowPickupForm(true)}
          />
        )}

        {/* Section 1: Shipment Info */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#02284d]" />
              Shipment Details
            </h2>
            {isDraft && (
              <Link href={`/dashboard/shipments/${shipmentId}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            )}
          </div>

          {/* Transport Mode Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isWater ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-sky-50 text-sky-800 border-sky-200'}`}>
              {isWater ? '🚢 Water Freight' : '✈️ Air Freight'}
              {isWater && shipment.water_type && (
                <span className="text-blue-600 font-normal ml-1">
                  · {shipment.water_type === 'inland_lake' ? 'Inland Lake' : shipment.water_type === 'ocean' ? 'Ocean' : 'Coastal'}
                </span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {[
              { label: 'Shipment ID', value: shipment.shipment_id },
              { label: 'Product Type', value: shipment.product_type },
              { label: 'Quantity', value: shipment.quantity },
              { label: 'Weight', value: `${Number(shipment.weight_kg).toLocaleString()} kg` },
              { label: 'Destination', value: destinationDisplay },
              { label: 'Departure Date', value: formatDate(shipment.preferred_departure_date) },
              { label: 'Buyer', value: shipment.buyer_name },
              { label: 'Invoice Value', value: formatCurrency(Number(shipment.invoice_value_usd)) },
              { label: 'Incoterm', value: shipment.incoterm },
              { label: 'Created', value: formatDate(shipment.created_at) },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.label}</dt>
                <dd className="text-sm text-gray-900 mt-0.5 font-medium">{item.value}</dd>
              </div>
            ))}
          </div>

          {/* Water-specific fields */}
          {isWater && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-[#02284d] uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Waves className="h-3.5 w-3.5" />
                Water Freight Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                {shipment.lake_name && (
                  <div>
                    <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Lake</dt>
                    <dd className="text-sm text-gray-900 mt-0.5 font-medium">Lake {shipment.lake_name}</dd>
                  </div>
                )}
                {shipment.port_of_loading && (
                  <div>
                    <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Port of Loading</dt>
                    <dd className="text-sm text-gray-900 mt-0.5 font-medium">{shipment.port_of_loading}</dd>
                  </div>
                )}
                {shipment.port_of_discharge && (
                  <div>
                    <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Port of Discharge</dt>
                    <dd className="text-sm text-gray-900 mt-0.5 font-medium">{shipment.port_of_discharge}</dd>
                  </div>
                )}
                {shipment.vessel_operator && (
                  <div>
                    <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      {shipment.water_type === 'inland_lake' ? 'Vessel Operator' : 'Shipping Line'}
                    </dt>
                    <dd className="text-sm text-gray-900 mt-0.5 font-medium">{shipment.vessel_operator}</dd>
                  </div>
                )}
                {shipment.vessel_name && (
                  <div>
                    <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Vessel Name</dt>
                    <dd className="text-sm text-gray-900 mt-0.5 font-medium">{shipment.vessel_name}</dd>
                  </div>
                )}
                {shipment.voyage_number && (
                  <div>
                    <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Voyage Number</dt>
                    <dd className="text-sm text-gray-900 mt-0.5 font-medium">{shipment.voyage_number}</dd>
                  </div>
                )}
                {shipment.container_type && shipment.container_type !== 'N/A' && (
                  <div>
                    <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Container Type</dt>
                    <dd className="text-sm text-gray-900 mt-0.5 font-medium">{shipment.container_type}</dd>
                  </div>
                )}
                {shipment.container_number && (
                  <div>
                    <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Container Number</dt>
                    <dd className="text-sm text-gray-900 mt-0.5 font-medium">{shipment.container_number}</dd>
                  </div>
                )}
                {shipment.bill_of_lading_number && (
                  <div>
                    <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Bill of Lading</dt>
                    <dd className="text-sm text-gray-900 mt-0.5 font-medium">{shipment.bill_of_lading_number}</dd>
                  </div>
                )}
                {shipment.port_cutoff_date && (
                  <div>
                    <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">Port Cut-off Date</dt>
                    <dd className="text-sm text-gray-900 mt-0.5 font-medium">{formatDate(shipment.port_cutoff_date)}</dd>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Section 2: Documents */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-5">Documents</h2>
          <DocumentUpload
            shipmentId={shipmentId}
            documents={documents}
            onUpload={handleDocumentUpload}
            readonly={!['Draft', 'Documents Pending', 'Booking Requested'].includes(shipment.status)}
            transportMode={shipment.transport_mode}
            waterType={shipment.water_type}
          />
        </Card>

        {/* Section 3: Status Timeline */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-5">Shipment Progress</h2>
          <StatusTimeline
            currentStatus={shipment.status}
            logs={statusLogs}
            transportMode={shipment.transport_mode}
          />
        </Card>

        {/* Section 4: Cargo Booking */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Cargo Booking</h2>
          {hasRequestedBooking || bookingSuccess ? (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Booking Requested</p>
                <p className="text-xs text-blue-700">
                  Our team is coordinating {isWater ? 'vessel space' : 'cargo space'}. You'll receive an email confirmation.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Once your documents are ready, request {isWater ? 'vessel space' : 'cargo space'} from our team.
                {!isWater && ' We coordinate airline bookings on your behalf.'}
              </p>
              <Button
                onClick={handleRequestBooking}
                loading={bookingLoading}
                disabled={!canRequestBooking}
                size="lg"
              >
                Request {isWater ? 'Vessel' : 'Cargo'} Booking
              </Button>
              {!canRequestBooking && (
                <p className="text-xs text-gray-500 mt-2">
                  Cargo booking is only available from Draft or Documents Pending status.
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Section 5: Cargo Pickup */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Cargo Pickup</h2>
          {pickup ? (
            <PickupStatusCard pickup={pickup} />
          ) : canRequestPickup ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Arrange last-mile cargo pickup from your premises to the{' '}
                {isWater ? (shipment.port_of_loading || 'port') : (shipment.destination_airport ? `${shipment.destination_airport} cargo terminal` : 'terminal')}.
              </p>
              <Button onClick={() => setShowPickupForm(true)} variant="outline" size="lg">
                Request Cargo Pickup
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">
                Cargo pickup requests are available for shipments in Draft, Documents Pending, or Booking Requested status.
              </p>
            </div>
          )}
        </Card>

        {/* Status History */}
        {statusLogs.length > 0 && (
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Status History</h2>
            <div className="space-y-3">
              {statusLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#02284d] mt-2 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {log.previous_status && (
                        <>
                          <span className="text-gray-500">{log.previous_status}</span>
                          <span className="text-gray-400">→</span>
                        </>
                      )}
                      <span className="font-medium text-gray-900">{log.new_status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(log.changed_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {log.note && ` · ${log.note}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Pickup Request Modal */}
      {showPickupForm && shipment && (
        <PickupRequestForm
          shipmentId={shipmentId}
          shipment={shipment}
          onSuccess={(newPickup) => {
            setPickup(newPickup)
            setShowPickupForm(false)
          }}
          onClose={() => setShowPickupForm(false)}
        />
      )}
    </div>
  )
}
