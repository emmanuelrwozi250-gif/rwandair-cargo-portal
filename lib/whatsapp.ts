// Best-effort WhatsApp sender via Twilio. No-ops when credentials are absent
// so every caller can fire-and-forget without feature flags.
export async function sendWhatsApp(toE164: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const auth = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_FROM
  if (!sid || !auth || !from) return false

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${auth}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: from,
        To: `whatsapp:${toE164.replace(/^whatsapp:/, '')}`,
        Body: body,
      }),
    })
    if (!res.ok) console.error('[whatsapp] Twilio error:', await res.text())
    return res.ok
  } catch (err) {
    console.error('[whatsapp] send failed:', err)
    return false
  }
}
