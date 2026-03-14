export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { sendNewExporterRegistrationEmail } from '@/lib/email'
import { Exporter } from '@/types'

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getAdminClient()
    const body = await request.json()
    const {
      user_id,
      company_name,
      business_registration_number,
      export_license_number,
      contact_person,
      email,
      phone,
      export_category,
      primary_export_destination,
    } = body

    // Insert user profile
    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: user_id,
      email,
      role: 'exporter',
    })

    if (userError && !userError.message.includes('duplicate')) {
      console.error('User insert error:', userError)
    }

    // Insert exporter profile
    const { data: exporter, error: exporterError } = await supabaseAdmin
      .from('exporters')
      .insert({
        user_id,
        company_name,
        business_registration_number,
        export_license_number,
        contact_person,
        email,
        phone,
        export_category,
        primary_export_destination,
        status: 'pending',
      })
      .select()
      .single()

    if (exporterError) {
      return NextResponse.json({ error: exporterError.message }, { status: 400 })
    }

    // Send admin notification (non-blocking)
    try {
      await sendNewExporterRegistrationEmail(exporter as Exporter)
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
