'use client'

import { useState, useRef } from 'react'
import { Document, DocumentType, TransportMode, WaterType } from '@/types'
import { Upload, FileText, CheckCircle, Download, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  shipmentId: string
  documents: Document[]
  onUpload: (doc: Document) => void
  readonly?: boolean
  transportMode?: TransportMode
  waterType?: WaterType
}

function getDocConfig(transportMode?: TransportMode, waterType?: WaterType): {
  required: DocumentType[]
  optional: DocumentType[]
} {
  if (transportMode === 'water') {
    if (waterType === 'inland_lake') {
      return {
        required: [
          'Commercial Invoice',
          'Inland Waterway Bill',
          'Cargo Manifest',
          'Packing List',
          'Export License',
        ],
        optional: ['Port Health Certificate'],
      }
    }
    // ocean or coastal
    return {
      required: [
        'Commercial Invoice',
        'Bill of Lading',
        'Certificate of Origin',
        'Packing List',
        'Vessel Booking Confirmation',
        'Export License',
      ],
      optional: ['Phytosanitary Certificate'],
    }
  }
  // air (default)
  return {
    required: ['Commercial Invoice', 'Packing List', 'Export License'],
    optional: ['Phytosanitary Certificate', 'Other'],
  }
}

export default function DocumentUpload({
  shipmentId,
  documents,
  onUpload,
  readonly,
  transportMode,
  waterType,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const { required: REQUIRED_DOCS, optional: OPTIONAL_DOCS } = getDocConfig(transportMode, waterType)

  const getDocumentForType = (type: DocumentType) => {
    return documents.filter((d) => d.document_type === type)
  }

  const uploadedCount = REQUIRED_DOCS.filter((type) =>
    documents.some((d) => d.document_type === type)
  ).length

  const completionPercent = Math.round((uploadedCount / REQUIRED_DOCS.length) * 100)

  const handleUpload = async (docType: DocumentType, file: File) => {
    setUploading(docType)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('shipment_id', shipmentId)
    formData.append('document_type', docType)

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (!response.ok) {
        setError(result.error || 'Upload failed')
        return
      }

      onUpload(result.document)
    } finally {
      setUploading(null)
    }
  }

  const DocRow = ({ docType, optional }: { docType: DocumentType; optional?: boolean }) => {
    const uploaded = getDocumentForType(docType)
    const isUploaded = uploaded.length > 0
    const isUploading = uploading === docType

    return (
      <div className={cn(
        'flex items-center justify-between py-3 px-4 rounded-lg border',
        isUploaded ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
      )}>
        <div className="flex items-center gap-3 min-w-0">
          {isUploaded ? (
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {docType}
              {optional && <span className="text-xs text-gray-400 ml-1.5 font-normal">optional</span>}
            </p>
            {isUploaded && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                {uploaded.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{doc.file_name}</span>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#02284d] hover:underline flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!readonly && (
          <div className="ml-4 flex-shrink-0">
            <input
              ref={(el) => { fileInputRefs.current[docType] = el }}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(docType, file)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRefs.current[docType]?.click()}
              disabled={isUploading}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors',
                isUploaded
                  ? 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  : 'bg-[#02284d] text-[#FBE115] hover:bg-[#01193a]'
              )}
            >
              {isUploading ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="h-3 w-3" /> {isUploaded ? 'Replace' : 'Upload'}</>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-600 font-medium">Required documents ({uploadedCount} of {REQUIRED_DOCS.length})</span>
          <span className="font-semibold text-[#02284d]">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#02284d] rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Required documents */}
      <div className="space-y-2">
        {REQUIRED_DOCS.map((docType) => (
          <DocRow key={docType} docType={docType as DocumentType} />
        ))}
      </div>

      {/* Optional documents */}
      {OPTIONAL_DOCS.length > 0 && (
        <div className="space-y-2">
          {OPTIONAL_DOCS.map((docType) => (
            <DocRow key={docType} docType={docType as DocumentType} optional />
          ))}
        </div>
      )}
    </div>
  )
}
