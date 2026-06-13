import { jsPDF } from 'jspdf'
import type { Eawb, AgentInvoice, Profile, AgentBooking } from '@/types'

const BLUE = '#00529C'

// Simplified IATA-format air waybill. Not a filable carrier AWB, but captures
// the standard fields in the conventional layout for the agent's records.
export function generateAwbPdf(awb: Eawb, companyName: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = 48

  doc.setFillColor(BLUE)
  doc.rect(0, 0, W, 70, 'F')
  doc.setTextColor('#FBE115'); doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
  doc.text('RwandAir CARGO', 40, 40)
  doc.setTextColor('#FFFFFF'); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text('Air Waybill · IATA format', 40, 56)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13)
  doc.text(`AWB ${awb.awb_number}`, W - 40, 44, { align: 'right' })

  y = 100
  doc.setTextColor('#111111')
  const row = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor('#6c757d')
    doc.text(label.toUpperCase(), 40, y)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor('#111111')
    doc.text(value || '—', 40, y + 14)
    y += 38
  }
  const two = (l1: string, v1: string, l2: string, v2: string) => {
    const mid = W / 2
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor('#6c757d')
    doc.text(l1.toUpperCase(), 40, y); doc.text(l2.toUpperCase(), mid, y)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor('#111111')
    doc.text(v1 || '—', 40, y + 14); doc.text(v2 || '—', mid, y + 14)
    y += 38
  }

  const shipper = awb.shipper || {}
  const consignee = awb.consignee || {}
  row('Issued by (agent)', companyName)
  two('Shipper', shipper.name ?? '', 'Consignee', consignee.name ?? '')
  two('Shipper address', shipper.address ?? '', 'Consignee address', consignee.address ?? '')
  row('Commodity', awb.commodity ?? '')
  two('Pieces', String(awb.pieces ?? '—'), 'Gross weight', awb.weight_kg ? `${awb.weight_kg} kg` : '—')
  two('Dimensions', awb.dimensions ?? '', 'Special handling', (awb.special_handling ?? []).join(', '))
  row('Issued', new Date(awb.created_at).toLocaleString('en-GB'))

  doc.setDrawColor('#e2e8f0'); doc.line(40, y, W - 40, y); y += 24
  doc.setFontSize(8); doc.setTextColor('#6c757d')
  doc.text('Built to Move Africa · From Africa, For the World · Kigali International Airport, Rwanda', 40, y)

  doc.save(`AWB-${awb.awb_number}.pdf`)
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export function generateBookingConfirmationPdf(b: AgentBooking, companyName: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(BLUE); doc.rect(0, 0, W, 70, 'F')
  doc.setTextColor('#FBE115'); doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
  doc.text('RwandAir CARGO', 40, 40)
  doc.setTextColor('#FFFFFF'); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text('Booking confirmation', 40, 56)

  let y = 110
  const line = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor('#6c757d')
    doc.text(label.toUpperCase(), 40, y)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor('#111111')
    doc.text(value || '—', 220, y); y += 28
  }
  doc.setTextColor('#111111'); doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
  doc.text(companyName || 'Agency', 40, y); y += 26
  line('Flight', b.flight_number ?? '—')
  line('Route', b.route)
  line('Departure', b.departure_at ? new Date(b.departure_at).toLocaleString('en-GB') : '—')
  line('Product', b.product_type)
  line('Pieces', String(b.pieces ?? '—'))
  line('Weight', b.weight_kg ? `${b.weight_kg} kg` : '—')
  line('Status', b.status)
  line('AWB', b.awb_number ?? 'Not yet issued')
  if (b.charges_usd != null) line('Charges', usd(b.charges_usd))

  y += 12; doc.setFontSize(8); doc.setTextColor('#6c757d')
  doc.text('Built to Move Africa · cargo@rwandair.com · +250 788 177 000', 40, y)
  doc.save(`Booking-${b.flight_number ?? b.id.slice(0, 8)}.pdf`)
}

export function generateInvoicePdf(inv: AgentInvoice, profile: Profile) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()

  doc.setFillColor(BLUE); doc.rect(0, 0, W, 70, 'F')
  doc.setTextColor('#FBE115'); doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
  doc.text('RwandAir CARGO', 40, 40)
  doc.setTextColor('#FFFFFF'); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text('Consolidated cargo invoice', 40, 56)

  let y = 110
  doc.setTextColor('#111111'); doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
  doc.text(profile.company_name || profile.email, 40, y); y += 22
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor('#6c757d')
  doc.text(`Period: ${inv.period_start} → ${inv.period_end}`, 40, y); y += 16
  if (inv.due_date) { doc.text(`Payment due: ${inv.due_date}`, 40, y); y += 16 }

  y += 16
  const line = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(bold ? 12 : 10)
    doc.setTextColor(bold ? '#00529C' : '#111111')
    doc.text(label, 40, y); doc.text(value, W - 40, y, { align: 'right' }); y += 22
  }
  doc.setDrawColor('#e2e8f0'); doc.line(40, y - 8, W - 40, y - 8)
  line('Total shipments', String(inv.total_shipments))
  line('Total weight', `${inv.total_weight_kg} kg`)
  doc.line(40, y - 8, W - 40, y - 8)
  line('Total charges', usd(inv.total_charges_usd), true)

  y += 30; doc.setFontSize(8); doc.setTextColor('#6c757d')
  doc.text('Built to Move Africa · cargo@rwandair.com · +250 788 177 000', 40, y)

  doc.save(`RwandAir-Cargo-Invoice-${inv.period_start}.pdf`)
}
