// Supabase Edge Function — Mona Shores Flats lead capture
// Deployed at: supabase.com → Edge Functions → submit-msf-lead
// Secrets needed: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLAUDE_API_KEY, CLAUDE_MODEL, RESEND_API_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MSF_PROPERTY_ID = 'e0e40206-6e8e-4ab7-8aa2-3b447570b01d'
const APPLY_URL = 'https://monashoresflats.securecafe.com/onlineleasing/mona-shores-flats/guestlogin.aspx?'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, phone, email, intent, entry, source } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Build notes field — mirrors apartments.com/rentcafe format
    const notes = [
      `Intent: ${intent}`,
      entry  ? `Entry: ${entry}`   : null,
      source ? `Source: ${source}` : 'Source: website_chat',
    ].filter(Boolean).join(' | ')

    // Infer unit_type from intent string
    const unitType =
      /1[\s-]?bed/i.test(intent) ? '1 Bedroom' :
      /2[\s-]?bed/i.test(intent) ? '2 Bedroom' :
      /3[\s-]?bed/i.test(intent) ? '3 Bedroom' : null

    // Insert lead
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        property_id: MSF_PROPERTY_ID,
        lead_source: 'website_chat',
        name,
        email:   email || null,
        phone_number: phone || null,
        unit_type: unitType,
        preferred_communication: email ? 'email' : 'phone',
        notes,
        status: 'new',
        is_duplicate: false,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Only send email if we have an address and Resend key
    if (email && Deno.env.get('RESEND_API_KEY')) {
      const firstName = name.split(' ')[0]

      // Generate personalized email using Claude
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key':          Deno.env.get('CLAUDE_API_KEY')!,
          'anthropic-version':  '2023-06-01',
          'content-type':       'application/json',
        },
        body: JSON.stringify({
          model: Deno.env.get('CLAUDE_MODEL') || 'claude-haiku-4-5-20251001',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Write a short, warm follow-up email from Makenna at Mona Shores Flats to ${firstName}.

Their inquiry: "${intent}"
How they found us: ${entry || 'website chat'}

PROPERTY FACTS:
- Brand new apartments at 267 Seminole Rd, Norton Shores MI (5 min from Muskegon)
- Steps from Mona Lake Park — pet friendly community
- 1BR from $1,425/mo (834–934 sqft) · 2BR from $1,750/mo · 3BR from $2,100–$2,375/mo
- In-unit washer/dryer, dishwasher, private balcony or patio, fitness center, pickleball courts, dog run
- CURRENT SPECIAL: First month FREE when lease signed before April 1, 2026
- Tours: Mon–Sat 9am–6pm, call 616.558.0317 or reply to this email
- Apply: ${APPLY_URL}

Write 3 short paragraphs. Personalize to their inquiry. Always mention first month free. End with a clear CTA to schedule a tour. Sign as Makenna.
Return ONLY the email body as clean HTML (no <html>/<body> wrapper, no subject line).`,
          }],
        }),
      })

      const claudeData = await claudeRes.json()
      const emailHtml  = claudeData.content?.[0]?.text

      if (emailHtml) {
        // Send via Resend
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            from:    'Makenna at Mona Shores Flats <makennak@gulkergroup.com>',
            to:      [email],
            subject: `Welcome to Mona Shores Flats, ${firstName}! 🏠`,
            html:    emailHtml,
          }),
        })

        // Update lead row with email content + status
        if (resendRes.ok) {
          await supabase
            .from('leads')
            .update({
              email_content: emailHtml,
              email_sent_at: new Date().toISOString(),
              status: 'contacted',
            })
            .eq('id', lead.id)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, lead_id: lead.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
