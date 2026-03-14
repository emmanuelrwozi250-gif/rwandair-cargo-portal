export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const shipment_id = formData.get('shipment_id') as string
    const document_type = formData.get('document_type') as string

    if (!file || !shipment_id || !document_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify ownership
    const { data: exporter } = await supabaseAdmin
      .from('exporters')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!exporter) {
      return NextResponse.json({ error: 'Exporter not found' }, { status: 403 })
    }

    const { data: shipment } = await supabaseAdmin
      .from('shipments')
      .select('id')
      .eq('id', shipment_id)
      .eq('exporter_id', exporter.id)
      .single()

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found or access denied' }, { status: 403 })
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${shipment_id}/${document_type.replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('shipment-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: 'File upload failed: ' + uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('shipment-documents')
      .getPublicUrl(fileName)

    // Save document record
    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .insert({
        shipment_id,
        document_type,
        file_url: urlData.publicUrl,
        file_name: file.name,
      })
      .select()
      .single()

    if (docError) return NextResponse.json({ error: docError.message }, { status: 400 })

    return NextResponse.json({ success: true, document: doc })
  } catch (err) {
    console.error('Document upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
