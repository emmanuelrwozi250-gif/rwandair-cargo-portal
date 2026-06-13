import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

// ─── Simple in-memory rate limiter (resets on cold start) ─────────────────────
// Limit: 20 requests per IP per minute
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
const ipStore = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipStore.get(ip)
  if (!entry || now > entry.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count++
  return false
}
// ──────────────────────────────────────────────────────────────────────────────

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are the RwandAir Cargo Intelligence Agent — Africa's smartest cargo booking assistant.

You help freight forwarders, exporters, and logistics managers book cargo shipments, find consolidation opportunities, understand customs requirements, and navigate RwandAir's route network.

Your personality: warm, professional, efficient. You are Rwandan-proud and African-focused. You understand the realities of African trade: fragmented freight, perishables exports (flowers, vegetables, fish), pharmaceutical cold-chains, and the importance of the Kigali hub.

You can:
- Generate instant cargo quotes (ask for: origin, destination, commodity, weight)
- Match shipments to consolidation groups
- Identify perishable routing risks and shelf-life calculations
- Pre-generate document checklists (AWB, customs, phytosanitary)
- Explain customs requirements for different commodity types and destinations
- Recommend optimal routes based on cargo type and urgency
- Initiate WhatsApp tracking setup
- Explain how Kigali hub consolidation works for EBB/NBO shippers

When quoting, format prices clearly. When discussing perishables, always mention shelf-life impact. Keep responses concise but complete.

Always confirm critical details (weight, commodity, destination) before generating a quote. When you have enough information, provide a clear quote in this format:

---
**QUOTE — [ORIGIN] → [DESTINATION]**
📦 [Weight]kg [Commodity]
✈️ Route: [Route]
💵 Price: $[Amount] all-in (from)
⏱️ Transit: [Hours]h
---`

// Mock tool call handlers
function handleToolCall(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'get_quote': {
      const { origin, destination, commodity, weight_kg } = input
      const baseRate = commodity === 'PHARMACEUTICAL' ? 8.5
        : commodity === 'PERISHABLE' ? 7.2
        : 5.5
      const price = Math.round((baseRate as number) * (weight_kg as number))
      return JSON.stringify({
        options: [
          { type: 'fastest',  priceUsd: Math.round(price * 1.15), transitHours: 11, route: `${origin} → ${destination}` },
          { type: 'cheapest', priceUsd: Math.round(price * 0.94), transitHours: 16, route: `${origin} → DXB → ${destination}` },
          { type: 'reliable', priceUsd: Math.round(price * 1.10), transitHours: 11, route: `${origin} → ${destination}` },
        ]
      })
    }
    case 'find_consolidation': {
      return JSON.stringify({
        groups: [
          { id: 'CG-4421', flight: 'WB9308', departure: 'Tonight 23:00', legs: 'KGL→JIB→SHJ→JUB→KGL', remaining: '13.2t', savings: '17%', matched: true },
          { id: 'CG-4398', flight: 'WB9304', departure: 'Sat 23:00', legs: 'KGL→SHJ→KGL', remaining: '12.1t', savings: '12%', matched: false },
          { id: 'CG-4412', flight: 'WB9316', departure: 'Mon 00:30', legs: 'KGL→JIB→DWC→KGL', remaining: '16.5t', savings: '9%', matched: false },
        ]
      })
    }
    case 'check_capacity': {
      const { route } = input
      return JSON.stringify({
        route,
        flights: [
          { flight: 'WB9308', departure: 'Tonight 23:00', legs: 'KGL→JIB→SHJ→JUB→KGL', available: '13.2t', pctUsed: 40, aircraft: 'B737-800F' },
          { flight: 'WB9464', departure: 'Sat 11:30', legs: 'KGL→EBB→NBO→KGL', available: '1.1t', pctUsed: 95, aircraft: 'B737-800F' },
          { flight: 'WB9304', departure: 'Sat 23:00', legs: 'KGL→SHJ→KGL', available: '12.1t', pctUsed: 45, aircraft: 'B737-800F' },
          { flight: 'WB9316', departure: 'Mon 00:30', legs: 'KGL→JIB→DWC→KGL', available: '16.5t', pctUsed: 25, aircraft: 'B737-800F' },
        ]
      })
    }
    case 'get_customs_requirements': {
      const { commodity, destination } = input
      return JSON.stringify({
        commodity,
        destination,
        documents: [
          'Airway Bill (AWB)',
          'Commercial Invoice',
          'Packing List',
          commodity === 'PERISHABLE' ? 'Phytosanitary Certificate (KEPHIS/KCCA)' : null,
          commodity === 'PHARMACEUTICAL' ? 'Good Distribution Practice (GDP) Certificate' : null,
          'Certificate of Origin',
          `Import permit (${destination} customs)`,
        ].filter(Boolean)
      })
    }
    case 'initiate_whatsapp_tracking': {
      const { awb, phone } = input
      return JSON.stringify({
        success: true,
        message: `WhatsApp tracking activated for AWB ${awb}. Updates will be sent to ${phone}.`
      })
    }
    default:
      return JSON.stringify({ error: 'Unknown tool' })
  }
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_quote',
    description: 'Generate cargo quote with 3 options (fastest, cheapest, most reliable)',
    input_schema: {
      type: 'object' as const,
      properties: {
        origin:      { type: 'string', description: 'Origin airport IATA code' },
        destination: { type: 'string', description: 'Destination airport IATA code' },
        commodity:   { type: 'string', enum: ['GENERAL','PHARMACEUTICAL','PERISHABLE','DANGEROUS_GOODS','LIVE_ANIMALS','HIGH_VALUE'] },
        weight_kg:   { type: 'number', description: 'Chargeable weight in kg' },
      },
      required: ['origin', 'destination', 'commodity', 'weight_kg'],
    },
  },
  {
    name: 'find_consolidation',
    description: 'Find active consolidation groups matching the shipment',
    input_schema: {
      type: 'object' as const,
      properties: {
        origin:      { type: 'string' },
        destination: { type: 'string' },
        commodity:   { type: 'string' },
        weight_kg:   { type: 'number' },
      },
      required: ['origin', 'destination', 'commodity', 'weight_kg'],
    },
  },
  {
    name: 'check_capacity',
    description: 'Check available capacity on a route',
    input_schema: {
      type: 'object' as const,
      properties: {
        route: { type: 'string', description: 'Route e.g. KGL-LHR' },
        date:  { type: 'string', description: 'Date YYYY-MM-DD' },
      },
      required: ['route'],
    },
  },
  {
    name: 'get_customs_requirements',
    description: 'Get customs and document requirements for a commodity and destination',
    input_schema: {
      type: 'object' as const,
      properties: {
        commodity:   { type: 'string' },
        destination: { type: 'string', description: 'Destination airport or country code' },
      },
      required: ['commodity', 'destination'],
    },
  },
  {
    name: 'initiate_whatsapp_tracking',
    description: 'Set up WhatsApp tracking notifications for a shipment',
    input_schema: {
      type: 'object' as const,
      properties: {
        awb:   { type: 'string', description: 'Airway bill number' },
        phone: { type: 'string', description: 'WhatsApp phone number with country code' },
      },
      required: ['awb', 'phone'],
    },
  },
]

export async function POST(req: NextRequest) {
  // ── Rate limiting ────────────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment before sending another message.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
    )
  }
  // ────────────────────────────────────────────────────────────────────────────

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured. Add it to your .env.local file.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let messages: Anthropic.MessageParam[]
  try {
    const body = await req.json()
    messages = body?.messages as Anthropic.MessageParam[]
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let currentMessages = [...messages]

        // Agentic loop — handle tool calls
        while (true) {
          const response = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: currentMessages,
            tools: TOOLS,
            stream: true,
          })

          let fullText = ''
          const toolUseBlocks: Anthropic.ToolUseBlock[] = []
          let currentToolUse: Partial<Anthropic.ToolUseBlock> & { input_json?: string } | null = null
          let stopReason = ''

          for await (const chunk of response) {
            if (chunk.type === 'content_block_start') {
              if (chunk.content_block.type === 'tool_use') {
                currentToolUse = { ...chunk.content_block, input_json: '' }
              }
            } else if (chunk.type === 'content_block_delta') {
              if (chunk.delta.type === 'text_delta') {
                fullText += chunk.delta.text
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: chunk.delta.text })}\n\n`))
              } else if (chunk.delta.type === 'input_json_delta' && currentToolUse) {
                currentToolUse.input_json = (currentToolUse.input_json || '') + chunk.delta.partial_json
              }
            } else if (chunk.type === 'content_block_stop') {
              if (currentToolUse) {
                try {
                  currentToolUse.input = JSON.parse(currentToolUse.input_json || '{}')
                } catch {
                  currentToolUse.input = {}
                }
                toolUseBlocks.push(currentToolUse as Anthropic.ToolUseBlock)
                currentToolUse = null
              }
            } else if (chunk.type === 'message_delta') {
              stopReason = chunk.delta.stop_reason || ''
            }
          }

          if (stopReason !== 'tool_use' || toolUseBlocks.length === 0) {
            break
          }

          // Execute tool calls
          const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map(block => {
            const result = handleToolCall(block.name, block.input as Record<string, unknown>)
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'tool_use', name: block.name, result: JSON.parse(result) })}\n\n`
            ))
            return {
              type: 'tool_result' as const,
              tool_use_id: block.id,
              content: result,
            }
          })

          // Add assistant response and tool results to messages
          const assistantContent: (Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam)[] = []
          if (fullText) assistantContent.push({ type: 'text', text: fullText })
          toolUseBlocks.forEach(b => assistantContent.push({ type: 'tool_use', id: b.id, name: b.name, input: b.input }))

          currentMessages = [
            ...currentMessages,
            { role: 'assistant', content: assistantContent },
            { role: 'user', content: toolResults },
          ]
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
