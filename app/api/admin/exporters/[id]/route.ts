export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendExporterApprovedEmail, sendExporterRejectedEmail } from '@/lib/email'
import { Exporter } from '@/types'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    // Verify admin
    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData } = await supabaseAdmin.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { status, note } = await request.json()

    // Update exporter
    const { data: exporter, error } = await supabaseAdmin
      .from('exporters')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Send email notification
    try {
      if (status === 'approved') {
        await sendExporterApprovedEmail(exporter as Exporter)
      } else if (status === 'rejected') {
        await sendExporterRejectedEmail(exporter as Exporter, note)
      }
    } catch (emailErr) {
      console.error('Email error:', emailErr)
    }

    return NextResponse.json({ success: true, exporter })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
