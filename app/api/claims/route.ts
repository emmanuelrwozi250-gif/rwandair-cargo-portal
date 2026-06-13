import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { sendClaimConfirmationEmail, sendClaimDeskNotificationEmail } from '@/lib/email'
import { sendWhatsApp } from '@/lib/whatsapp'
import { checkClaimTimeLimit, CLAIM_FILE_LIMITS } from '@/lib/claims'
import { normalizeAwb, rateLimit, rateLimited, sameOrigin, forbiddenOrigin, EMAIL_REGEX } from '@/lib/public-forms'
import type { ClaimType, ClaimRelationship, ContactMethod } from '@/types'

export const runtime = 'nodejs'

const CLAIM_TYPES: ClaimType[] = ['Loss', 'Damage', 'Delay', 'Shortage', 'Pilferage']
const RELATIONSHIPS: ClaimRelationship[] = ['shipper', 'consignee', 'agent']
const CONTACT_METHODS: ContactMethod[] = ['email', 'whatsapp', 'phone']

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbiddenOrigin()
  if (!rateLimit(req, 'claims')) return rateLimited()

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form submission' }, { status: 400 })
  }

  const str = (k: string) => (form.get(k)?.toString() ?? '').trim()

  // ── Validate ────────────────────────────────────────────────────────────────
  const claimType = str('claimType') as ClaimType
  const awb = normalizeAwb(str('awb'))
  const description = str('description')
  const claimantName = str('claimantName')
  const claimantEmail = str('claimantEmail').toLowerCase()
  const claimantPhone = str('claimantPhone')
  const relationship = str('relationship') as ClaimRelationship
  const preferredContact = (str('preferredContact') || 'email') as ContactMethod
  const deliveryDate = str('deliveryDate')
  const declaredValue = str('declaredValue')
  const claimValue = str('claimValue')

  const problems: string[] = []
  if (!CLAIM_TYPES.includes(claimType)) problems.push('claim type')
  if (!awb) problems.push('AWB number (format 459-12345678)')
  if (description.length < 50) problems.push('description (minimum 50 characters)')
  if (!claimantName) problems.push('full name')
  if (!EMAIL_REGEX.test(claimantEmail)) problems.push('email address')
  if (!claimantPhone) problems.push('phone number')
  if (!RELATIONSHIPS.includes(relationship)) problems.push('relationship to shipment')
  if (!CONTACT_METHODS.includes(preferredContact)) problems.push('preferred contact method')
  if ((claimType === 'Loss' || claimType === 'Damage') && !declaredValue) problems.push('declared value (required for loss/damage)')
  if (form.get('goodCondition') !== 'true') problems.push('good-condition confirmation')

  if (problems.length) {
    return NextResponse.json(
      { error: `Please check the following: ${problems.join(', ')}.` },
      { status: 422 }
    )
  }

  // ── Files: server-side MIME + size enforcement ──────────────────────────────
  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length > CLAIM_FILE_LIMITS.maxFiles) {
    return NextResponse.json({ error: `Maximum ${CLAIM_FILE_LIMITS.maxFiles} files allowed.` }, { status: 422 })
  }
  for (const f of files) {
    if (f.size > CLAIM_FILE_LIMITS.maxBytes) {
      return NextResponse.json({ error: `"${f.name}" exceeds the 5 MB limit.` }, { status: 422 })
    }
    if (!CLAIM_FILE_LIMITS.acceptedMime.includes(f.type)) {
      return NextResponse.json({ error: `"${f.name}" is not an accepted file type (PDF, JPG, PNG).` }, { status: 422 })
    }
  }

  const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: 'The claims service is temporarily unavailable. Please email cargo@rwandair.com.' },
      { status: 503 }
    )
  }

  const admin = getAdminClient()

  // ── Upload supporting documents ─────────────────────────────────────────────
  const fileRefs: { name: string; path: string }[] = []
  for (const f of files) {
    const safeName = f.name.replace(/[^\w.\-]+/g, '_').slice(0, 80)
    const path = `${awb}/${Date.now()}-${safeName}`
    const { error: upErr } = await admin.storage
      .from('claim-documents')
      .upload(path, Buffer.from(await f.arrayBuffer()), { contentType: f.type })
    if (upErr) {
      console.error('[claims] upload error:', upErr.message)
      return NextResponse.json({ error: `Could not upload "${f.name}". Please try again.` }, { status: 500 })
    }
    fileRefs.push({ name: f.name, path })
  }

  // ── Time-limit assessment (IATA Resolution 600a) ───────────────────────────
  const timeCheck = deliveryDate ? checkClaimTimeLimit(claimType, deliveryDate) : null

  // ── Insert claim + opening timeline event ──────────────────────────────────
  const { data: claim, error: insErr } = await admin
    .from('claims')
    .insert({
      claim_type: claimType,
      awb,
      flight_number: str('flightNumber') || null,
      origin: str('origin') || null,
      destination: str('destination') || null,
      delivery_date: deliveryDate || null,
      declared_value_usd: declaredValue ? Number(declaredValue) : null,
      description,
      claim_value_usd: claimValue ? Number(claimValue) : null,
      file_urls: fileRefs,
      good_condition_confirmed: true,
      claimant_name: claimantName,
      claimant_company: str('claimantCompany') || null,
      claimant_email: claimantEmail,
      claimant_phone: claimantPhone,
      relationship,
      preferred_contact: preferredContact,
      time_limit_warning: timeCheck && !timeCheck.withinLimit ? timeCheck.message : null,
    })
    .select('id, claim_ref, claim_type, awb')
    .single()

  if (insErr || !claim) {
    console.error('[claims] insert error:', insErr?.message)
    return NextResponse.json({ error: 'Could not register the claim. Please try again.' }, { status: 500 })
  }

  await admin.from('claim_events').insert({
    claim_id: claim.id,
    status: 'Received',
    note: 'Claim submitted via the cargo portal.',
  })

  // ── Notifications (best-effort — claim is already registered) ──────────────
  try {
    if (process.env.RESEND_API_KEY) {
      await Promise.all([
        sendClaimConfirmationEmail({
          claim_ref: claim.claim_ref,
          claim_type: claimType,
          awb: awb!,
          claimant_name: claimantName,
          claimant_email: claimantEmail,
        }),
        sendClaimDeskNotificationEmail({
          claim_ref: claim.claim_ref,
          claim_type: claimType,
          awb: awb!,
          claimant_name: claimantName,
          claimant_email: claimantEmail,
          claimant_phone: claimantPhone,
          claim_value_usd: claimValue ? Number(claimValue) : null,
          description,
          time_limit_warning: timeCheck && !timeCheck.withinLimit ? timeCheck.message : null,
        }),
      ])
    }
    if (preferredContact === 'whatsapp') {
      await sendWhatsApp(
        claimantPhone,
        `RwandAir Cargo: your claim ${claim.claim_ref} (AWB ${awb}) has been registered. Our cargo desk will contact you within 72 hours. Track status: ${process.env.NEXT_PUBLIC_APP_URL}/claims?ref=${claim.claim_ref}`
      )
    }
  } catch (err) {
    console.error('[claims] notification error:', err)
  }

  return NextResponse.json({
    claimRef: claim.claim_ref,
    timeLimitWarning: timeCheck && !timeCheck.withinLimit ? timeCheck.message : null,
  })
}
