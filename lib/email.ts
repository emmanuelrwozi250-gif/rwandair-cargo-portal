import { Resend } from 'resend'
import { Shipment, Exporter, PickupRequest, Transporter } from '@/types'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@altitudeafrica.com'
const FROM_EMAIL = 'Altitude <no-reply@altitudeafrica.com>'

function shipmentDetailsHtml(shipment: Shipment & { exporters?: Exporter }): string {
  const isWater = shipment.transport_mode === 'water'
  const destinationRow = isWater
    ? `<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Route</td><td style="padding:6px 12px">${escapeHtml(shipment.port_of_loading || '')} → ${escapeHtml(shipment.port_of_discharge || shipment.destination_country)}</td></tr>`
    : `<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Destination</td><td style="padding:6px 12px">${escapeHtml(shipment.destination_country)} (${escapeHtml(shipment.destination_airport || '')})</td></tr>`

  return `
    <table style="border-collapse:collapse;width:100%;margin-top:16px;">
      <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600;width:40%">Shipment ID</td><td style="padding:6px 12px">${escapeHtml(shipment.shipment_id)}</td></tr>
      <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Product</td><td style="padding:6px 12px">${escapeHtml(shipment.product_type)}</td></tr>
      <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Mode</td><td style="padding:6px 12px">${isWater ? 'Water Freight' : 'Air Freight'}</td></tr>
      ${destinationRow}
      <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Weight</td><td style="padding:6px 12px">${shipment.weight_kg} kg</td></tr>
      <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Invoice Value</td><td style="padding:6px 12px">USD ${Number(shipment.invoice_value_usd).toLocaleString()}</td></tr>
      <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Departure Date</td><td style="padding:6px 12px">${escapeHtml(shipment.preferred_departure_date)}</td></tr>
    </table>
  `
}

function emailWrapper(content: string): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2332;">
      <div style="background:#02284d;padding:24px 32px;border-radius:8px 8px 0 0;">
        <h1 style="color:#E4DC1F;font-size:22px;margin:0;font-weight:700;letter-spacing:-0.5px;">ALTITUDE</h1>
        <p style="color:#a0aec0;font-size:13px;margin:4px 0 0;">Export Workflow Platform</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
        ${content}
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">Altitude Africa · Nairobi, Kenya</p>
    </div>
  `
}

// ===== EXPORTER ACCOUNT EMAILS =====

export async function sendNewExporterRegistrationEmail(exporter: Exporter) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Exporter Registration: ${exporter.company_name}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">New Exporter Registration</h2>
      <p style="color:#64748b;margin:0 0 24px;">A new exporter has submitted their registration and is awaiting approval.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600;width:40%">Company</td><td style="padding:6px 12px">${exporter.company_name}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Contact</td><td style="padding:6px 12px">${exporter.contact_person}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Email</td><td style="padding:6px 12px">${exporter.email}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Category</td><td style="padding:6px 12px">${exporter.export_category}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Destination</td><td style="padding:6px 12px">${exporter.primary_export_destination}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Reg Number</td><td style="padding:6px 12px">${exporter.business_registration_number}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">License</td><td style="padding:6px 12px">${exporter.export_license_number}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Submitted</td><td style="padding:6px 12px">${new Date(exporter.created_at).toLocaleDateString()}</td></tr>
      </table>
      <div style="margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/exporters" style="background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Review in Admin Dashboard →</a>
      </div>
    `),
  })
}

export async function sendExporterApprovedEmail(exporter: Exporter) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporter.email,
    subject: 'Your Altitude account has been approved',
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Welcome to Altitude, ${exporter.contact_person}!</h2>
      <p style="color:#64748b;margin:0 0 16px;">Your exporter account for <strong>${exporter.company_name}</strong> has been approved. You now have full access to the platform.</p>
      <p style="color:#64748b;margin:0 0 24px;">You can now create shipments, upload documents, and request cargo bookings through your dashboard.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Go to Your Dashboard →</a>
    `),
  })
}

export async function sendExporterRejectedEmail(exporter: Exporter, reason?: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporter.email,
    subject: 'Update on your Altitude application',
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Application Update</h2>
      <p style="color:#64748b;margin:0 0 16px;">Thank you for your interest in Altitude, ${exporter.contact_person}.</p>
      <p style="color:#64748b;margin:0 0 16px;">After reviewing your application for <strong>${exporter.company_name}</strong>, we are unable to approve your account at this time.</p>
      ${reason ? `<p style="color:#64748b;margin:0 0 16px;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : ''}
      <p style="color:#64748b;margin:0;">If you believe this is an error or would like to reapply, please contact us at <a href="mailto:${ADMIN_EMAIL}" style="color:#02284d;">${ADMIN_EMAIL}</a>.</p>
    `),
  })
}

// ===== AIR FREIGHT EMAILS =====

export async function sendBookingRequestedEmail(shipment: Shipment & { exporters?: Exporter | { email: string; company_name: string } | null }) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Booking Request: ${shipment.shipment_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">New Cargo Booking Request</h2>
      <p style="color:#64748b;margin:0 0 24px;">An exporter has requested cargo space for the following shipment:</p>
      ${shipmentDetailsHtml(shipment as Shipment & { exporters?: Exporter })}
      ${shipment.exporters ? `<p style="margin-top:16px;color:#64748b;"><strong>Exporter:</strong> ${(shipment.exporters as { company_name: string }).company_name} (${(shipment.exporters as { email: string }).email})</p>` : ''}
      <div style="margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/shipments" style="background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Review Booking Request →</a>
      </div>
    `),
  })
}

export async function sendSpaceConfirmedEmail(shipment: Shipment, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Cargo Space Confirmed – ${shipment.shipment_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Cargo Space Confirmed</h2>
      <p style="color:#64748b;margin:0 0 24px;">Great news! Cargo space has been confirmed for your shipment.</p>
      ${shipmentDetailsHtml(shipment)}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${shipment.id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Shipment →</a>
    `),
  })
}

export async function sendInTransitEmail(shipment: Shipment, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Your shipment is In Transit – ${shipment.shipment_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Shipment In Transit</h2>
      <p style="color:#64748b;margin:0 0 24px;">Your shipment is now in transit to its destination.</p>
      ${shipmentDetailsHtml(shipment)}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${shipment.id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Track Shipment →</a>
    `),
  })
}

export async function sendDeliveredEmail(shipment: Shipment, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Shipment Delivered – ${shipment.shipment_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Shipment Delivered</h2>
      <p style="color:#64748b;margin:0 0 24px;">Your shipment has been successfully delivered.</p>
      ${shipmentDetailsHtml(shipment)}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${shipment.id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Details →</a>
    `),
  })
}

// ===== WATER FREIGHT EMAILS =====

export async function sendWaterBookingRequestedEmail(
  shipment: Shipment,
  exporterCompany: string,
  exporterEmail: string
) {
  const resend = getResend()
  const waterTypeLabel = shipment.water_type === 'inland_lake' ? 'Inland Lake' : shipment.water_type === 'ocean' ? 'Ocean' : 'Coastal'
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Water Freight Booking Request: ${shipment.shipment_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">New Water Freight Booking Request</h2>
      <p style="color:#64748b;margin:0 0 8px;">An exporter has requested vessel space — <strong>${waterTypeLabel} freight</strong>.</p>
      <p style="color:#64748b;margin:0 0 24px;"><strong>Exporter:</strong> ${escapeHtml(exporterCompany)} (${escapeHtml(exporterEmail)})</p>
      ${shipmentDetailsHtml(shipment)}
      ${shipment.vessel_operator ? `<p style="margin-top:12px;color:#64748b;"><strong>Preferred Vessel Operator:</strong> ${escapeHtml(shipment.vessel_operator)}</p>` : ''}
      ${shipment.container_type && shipment.container_type !== 'N/A' ? `<p style="color:#64748b;"><strong>Container Type:</strong> ${escapeHtml(shipment.container_type)}</p>` : ''}
      ${shipment.port_cutoff_date ? `<p style="color:#e53e3e;"><strong>Port Cut-off:</strong> ${escapeHtml(shipment.port_cutoff_date)}</p>` : ''}
      <div style="margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/shipments" style="background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Review Booking Request →</a>
      </div>
    `),
  })
}

export async function sendVesselSpaceConfirmedEmail(shipment: Shipment, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Vessel Space Confirmed – ${shipment.shipment_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Vessel Space Confirmed</h2>
      <p style="color:#64748b;margin:0 0 24px;">Vessel space has been confirmed for your water freight shipment.</p>
      ${shipmentDetailsHtml(shipment)}
      ${shipment.vessel_name ? `<p style="margin-top:12px;color:#64748b;"><strong>Vessel:</strong> ${escapeHtml(shipment.vessel_name)}</p>` : ''}
      ${shipment.voyage_number ? `<p style="color:#64748b;"><strong>Voyage:</strong> ${escapeHtml(shipment.voyage_number)}</p>` : ''}
      ${shipment.port_cutoff_date ? `<p style="color:#e53e3e;font-weight:600;margin-top:12px;">Port cut-off deadline: ${escapeHtml(shipment.port_cutoff_date)}. Ensure all documents are ready.</p>` : ''}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${shipment.id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Shipment →</a>
    `),
  })
}

export async function sendPortInEmail(shipment: Shipment, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Cargo at Port of Loading – ${shipment.shipment_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Cargo at Port of Loading</h2>
      <p style="color:#64748b;margin:0 0 24px;">Your cargo has arrived at the port of loading and is ready for vessel loading.</p>
      ${shipmentDetailsHtml(shipment)}
      ${shipment.port_of_loading ? `<p style="margin-top:12px;color:#64748b;"><strong>Port of Loading:</strong> ${escapeHtml(shipment.port_of_loading)}</p>` : ''}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${shipment.id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Shipment →</a>
    `),
  })
}

export async function sendVesselDepartedEmail(shipment: Shipment, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Vessel Departed – ${shipment.shipment_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Vessel Has Departed</h2>
      <p style="color:#64748b;margin:0 0 24px;">Your cargo is on board and the vessel has departed from the port of loading.</p>
      ${shipmentDetailsHtml(shipment)}
      ${shipment.vessel_name ? `<p style="margin-top:12px;color:#64748b;"><strong>Vessel:</strong> ${escapeHtml(shipment.vessel_name)}</p>` : ''}
      ${shipment.voyage_number ? `<p style="color:#64748b;"><strong>Voyage:</strong> ${escapeHtml(shipment.voyage_number)}</p>` : ''}
      ${shipment.port_of_discharge ? `<p style="color:#64748b;"><strong>Destination Port:</strong> ${escapeHtml(shipment.port_of_discharge)}</p>` : ''}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${shipment.id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Track Shipment →</a>
    `),
  })
}

export async function sendPortOfDischargeEmail(shipment: Shipment, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Cargo Arrived at Port of Discharge – ${shipment.shipment_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Cargo at Port of Discharge</h2>
      <p style="color:#64748b;margin:0 0 24px;">Your cargo has arrived at the destination port and is awaiting customs clearance and delivery.</p>
      ${shipmentDetailsHtml(shipment)}
      ${shipment.port_of_discharge ? `<p style="margin-top:12px;color:#64748b;"><strong>Port of Discharge:</strong> ${escapeHtml(shipment.port_of_discharge)}</p>` : ''}
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${shipment.id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Details →</a>
    `),
  })
}

// ===== PICKUP EMAILS =====

export async function sendPickupRequestedEmail(
  pickup: PickupRequest,
  shipmentId: string,
  adminEmail: string
) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `New Cargo Pickup Request: ${pickup.pickup_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">New Cargo Pickup Request</h2>
      <p style="color:#64748b;margin:0 0 24px;">An exporter has submitted a last-mile cargo pickup request.</p>
      <table style="border-collapse:collapse;width:100%;margin-top:16px;">
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600;width:40%">Pickup ID</td><td style="padding:6px 12px;font-family:monospace">${escapeHtml(pickup.pickup_id)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Shipment</td><td style="padding:6px 12px;font-family:monospace">${escapeHtml(shipmentId)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Pickup Address</td><td style="padding:6px 12px">${escapeHtml(pickup.pickup_address)}, ${escapeHtml(pickup.pickup_city)}, ${escapeHtml(pickup.pickup_country)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Contact</td><td style="padding:6px 12px">${escapeHtml(pickup.pickup_contact_name)} · ${escapeHtml(pickup.pickup_contact_phone)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Destination Terminal</td><td style="padding:6px 12px">${escapeHtml(pickup.destination_terminal)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Required Date</td><td style="padding:6px 12px">${escapeHtml(pickup.required_pickup_date)}${pickup.required_pickup_time_by ? ` by ${escapeHtml(pickup.required_pickup_time_by)}` : ''}</td></tr>
        ${pickup.total_weight_kg ? `<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Weight</td><td style="padding:6px 12px">${pickup.total_weight_kg} kg</td></tr>` : ''}
        ${pickup.special_handling_notes ? `<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Special Handling</td><td style="padding:6px 12px">${escapeHtml(pickup.special_handling_notes)}</td></tr>` : ''}
      </table>
      <div style="margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/pickups" style="background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Manage Pickups →</a>
      </div>
    `),
  })
}

export async function sendTransporterAssignedEmail(
  pickup: PickupRequest,
  transporter: Transporter,
  exporterEmail: string
) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Transporter Assigned – Pickup ${pickup.pickup_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Transporter Assigned to Your Pickup</h2>
      <p style="color:#64748b;margin:0 0 24px;">A transporter has been assigned to collect your cargo.</p>
      <table style="border-collapse:collapse;width:100%;margin-top:8px;">
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600;width:40%">Pickup ID</td><td style="padding:6px 12px;font-family:monospace">${escapeHtml(pickup.pickup_id)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Transporter</td><td style="padding:6px 12px">${escapeHtml(transporter.company_name)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Contact</td><td style="padding:6px 12px">${escapeHtml(transporter.contact_person)} · ${escapeHtml(transporter.phone)}</td></tr>
        ${pickup.estimated_pickup_time ? `<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Estimated Arrival</td><td style="padding:6px 12px">${escapeHtml(pickup.estimated_pickup_time)}</td></tr>` : ''}
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Pickup Address</td><td style="padding:6px 12px">${escapeHtml(pickup.pickup_address)}, ${escapeHtml(pickup.pickup_city)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Destination Terminal</td><td style="padding:6px 12px">${escapeHtml(pickup.destination_terminal)}</td></tr>
      </table>
      <p style="margin-top:16px;color:#64748b;font-size:13px;">Please ensure your cargo is packaged and ready for collection at the specified address.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${pickup.shipment_id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Pickup Status →</a>
    `),
  })
}

export async function sendPickupEnRouteEmail(pickup: PickupRequest, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Transporter En Route – Pickup ${pickup.pickup_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Transporter is En Route</h2>
      <p style="color:#64748b;margin:0 0 16px;">Your assigned transporter is on the way to collect your cargo.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600;width:40%">Pickup ID</td><td style="padding:6px 12px;font-family:monospace">${escapeHtml(pickup.pickup_id)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Pickup Address</td><td style="padding:6px 12px">${escapeHtml(pickup.pickup_address)}, ${escapeHtml(pickup.pickup_city)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Contact at Site</td><td style="padding:6px 12px">${escapeHtml(pickup.pickup_contact_name)} · ${escapeHtml(pickup.pickup_contact_phone)}</td></tr>
      </table>
      <p style="margin-top:16px;color:#64748b;font-size:13px;">Please ensure your contact is available at the pickup address.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${pickup.shipment_id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Track Pickup →</a>
    `),
  })
}

export async function sendPickupCargoCollectedEmail(pickup: PickupRequest, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Cargo Collected – Pickup ${pickup.pickup_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Cargo Has Been Collected</h2>
      <p style="color:#64748b;margin:0 0 16px;">Your cargo has been collected and is in transit to the terminal.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600;width:40%">Pickup ID</td><td style="padding:6px 12px;font-family:monospace">${escapeHtml(pickup.pickup_id)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Destination Terminal</td><td style="padding:6px 12px">${escapeHtml(pickup.destination_terminal)}</td></tr>
      </table>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${pickup.shipment_id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Track Progress →</a>
    `),
  })
}

export async function sendPickupDeliveredToTerminalEmail(pickup: PickupRequest, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Cargo Delivered to Terminal – Pickup ${pickup.pickup_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Cargo Delivered to Terminal</h2>
      <p style="color:#64748b;margin:0 0 16px;">Your cargo has been successfully delivered to the terminal and handed over.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600;width:40%">Pickup ID</td><td style="padding:6px 12px;font-family:monospace">${escapeHtml(pickup.pickup_id)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Terminal</td><td style="padding:6px 12px">${escapeHtml(pickup.destination_terminal)}</td></tr>
        ${pickup.actual_delivery_time ? `<tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Delivered At</td><td style="padding:6px 12px">${new Date(pickup.actual_delivery_time).toLocaleString('en-GB')}</td></tr>` : ''}
      </table>
      <p style="margin-top:16px;color:#64748b;font-size:13px;">Your cargo is now in the hands of the freight team. You will receive further updates as your shipment progresses.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${pickup.shipment_id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Shipment →</a>
    `),
  })
}

export async function sendPickupCancelledEmail(pickup: PickupRequest, exporterEmail: string) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: exporterEmail,
    subject: `Pickup Cancelled – ${pickup.pickup_id}`,
    html: emailWrapper(`
      <h2 style="font-size:18px;margin:0 0 8px;color:#02284d;">Pickup Request Cancelled</h2>
      <p style="color:#64748b;margin:0 0 16px;">Your cargo pickup request has been cancelled.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600;width:40%">Pickup ID</td><td style="padding:6px 12px;font-family:monospace">${escapeHtml(pickup.pickup_id)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Pickup Address</td><td style="padding:6px 12px">${escapeHtml(pickup.pickup_address)}, ${escapeHtml(pickup.pickup_city)}</td></tr>
      </table>
      ${pickup.admin_notes ? `<p style="margin-top:16px;color:#64748b;"><strong>Reason:</strong> ${escapeHtml(pickup.admin_notes)}</p>` : ''}
      <p style="margin-top:16px;color:#64748b;font-size:13px;">If you need to arrange a new pickup, please contact us or submit a new request through your dashboard.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shipments/${pickup.shipment_id}" style="display:inline-block;margin-top:24px;background:#02284d;color:#E4DC1F;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View Shipment →</a>
    `),
  })
}
