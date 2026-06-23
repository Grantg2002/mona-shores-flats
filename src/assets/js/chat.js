// ===== Mona Shores Flats — leasing chat assistant =====
(function () {
  const fab = document.getElementById('chatFab');
  if (!fab) return;

  // ---- Config ----
  const LEAD_ENDPOINT = 'https://larbpeheccgzaejtiaiv.supabase.co/functions/v1/submit-msf-lead';
  const AI_PROXY_URL  = 'https://msf-chat.YOURSUBDOMAIN.workers.dev'; // ← set after deploying the Worker
  const APPLY_URL     = 'https://monashoresflats.securecafe.com/onlineleasing/mona-shores-flats/guestlogin.aspx';
  const LISTING_URL   = 'https://www.rentcafe.com/apartments/mi/norton-shores/mona-shores-flats/default.aspx';

  const KNOWLEDGE = `You are the friendly leasing assistant for Mona Shores Flats. Keep replies under 3 sentences, warm, and end with a call-to-action.
FACTS: 267 Seminole Rd, Norton Shores MI 49444 (5 min from Muskegon). Phone (616) 737-8592. Built 2025, 120 units, pet friendly, Mona Shores schools, short walk to Mona Lake.
SPECIAL: One month free right now — a limited-time move-in offer; always mention it.
PRICING (starting): 1BR $1,425/834sqft; Barrier-Free 1BR $1,525/931sqft; 2BR $1,685/~1,090sqft; 3BR $2,085+/1,315-1,421sqft.
INCLUDED: in-unit W/D, dishwasher, granite + island, stainless, private balcony, central A/C, high ceilings, big closets. Community: fitness center, pickleball, dog run, playground, clubhouse, detached garages.
Apply: ${APPLY_URL} . If they want to tour or apply, collect first name + phone.`;

  // ---- Elements ----
  const panel = document.getElementById('chatPanel');
  const body  = document.getElementById('chatBody');
  const chips = document.getElementById('chatChips');
  const input = document.getElementById('chatInput');

  let open = false, started = false, aiHistory = [];
  let lead = { name: '', phone: '', email: '', intent: '' };
  let capture = null; // 'name' | 'phone' | 'email'

  const FLOWS = {
    start: { msg: "Hi there! 👋 Welcome to Mona Shores Flats. How can I help?", chips: ['Pricing & availability', 'Current specials 🎉', 'Schedule a tour', 'Apply now', 'Pets & parking', 'Talk to someone'] },
    'Pricing & availability': { msg: "Starting rents:\n• 1 BR — $1,425 · 834 sq ft\n• Barrier-Free 1 BR — $1,525 · 931 sq ft\n• 2 BR / 2 BA — $1,685 · ~1,090 sq ft\n• 3 BR / 2 BA — $2,085 · up to 1,421 sq ft\n\nAll homes: in-unit W/D, dishwasher, granite, balcony, A/C. 🎉 One month free right now — limited time!", chips: ['Check live availability', 'Current specials 🎉', 'Schedule a tour', 'Apply now', 'Back'] },
    'Check live availability': { action: 'availability' },
    'Current specials 🎉': { msg: "🎉 Right now: your FIRST MONTH IS FREE — a limited-time move-in offer. Limited homes left — want to lock in your floor plan?", chips: ['Schedule a tour', 'Apply now', 'Pricing & availability', 'Back'] },
    'Schedule a tour': { action: 'capture', intent: 'Tour Request' },
    'Apply now': { action: 'apply' },
    'Pets & parking': { msg: "We're pet friendly 🐾 (2 pets, breed restrictions, $55/dog DNA registration) and detached garages are available to rent. Call (616) 737-8592 for specifics.", chips: ['Schedule a tour', 'Call us', 'Back'] },
    'Talk to someone': { msg: "Of course! Reach McKenna in leasing:\n📞 (616) 737-8592\n✉️ makennak@gulkergroup.com\nMon–Sat 9am–6pm.", chips: ['Call us', 'Email McKenna', 'Back'] },
    'Call us': { action: 'call' },
    'Email McKenna': { action: 'email' },
    'Back': { action: 'back' }
  };

  const KEYWORDS = [
    { re: /price|pricing|cost|rent|rate|how much|\$|bed|bedroom|sqft|sq ft|afford/i, flow: 'Pricing & availability' },
    { re: /special|deal|promo|discount|free|offer|incentive|first month/i, flow: 'Current specials 🎉' },
    { re: /tour|visit|showing|see it|schedule|appointment|viewing/i, flow: 'Schedule a tour' },
    { re: /apply|application|move in|lease|sign/i, flow: 'Apply now' },
    { re: /pet|dog|cat|animal|park|garage|car/i, flow: 'Pets & parking' },
    { re: /person|human|agent|staff|talk|call|phone|contact|help/i, flow: 'Talk to someone' },
  ];

  function el(cls, text) { const d = document.createElement('div'); d.className = cls; if (text) { d.textContent = text; } return d; }
  function scroll() { body.scrollTop = body.scrollHeight; }

  function botSay(flow, aiText) {
    const msg = aiText || flow.msg;
    if (msg) { body.appendChild(el('chat-msg bot', msg)); scroll(); }
    chips.innerHTML = '';
    const list = flow.chips || (aiText ? ['Schedule a tour', 'Pricing & availability', 'Current specials 🎉', 'Back'] : []);
    list.forEach((label) => {
      const b = document.createElement('button');
      b.className = 'chat-chip'; b.textContent = label;
      b.onclick = () => handleChip(label);
      chips.appendChild(b);
    });
  }

  function userSay(text) { body.appendChild(el('chat-msg user', text)); chips.innerHTML = ''; scroll(); }

  function handleChip(label) {
    userSay(label);
    const flow = FLOWS[label];
    if (!flow) { handleText(label); return; }
    if (flow.action) { runAction(flow); return; }
    setTimeout(() => botSay(flow), 350);
  }

  function runAction(flow) {
    if (flow.action === 'capture') { lead = { name: '', phone: '', email: '', intent: flow.intent }; capture = 'name'; setTimeout(() => botSay({ msg: "Great! What's your first name?" }), 350); }
    else if (flow.action === 'apply') { window.open(APPLY_URL, '_blank'); setTimeout(() => botSay({ msg: "Opening our secure application in a new tab. 🎉 One month free right now! Anything else?", chips: ['Schedule a tour', 'Pricing & availability', 'Back'] }), 300); }
    else if (flow.action === 'availability') { window.open(LISTING_URL, '_blank'); setTimeout(() => botSay({ msg: "Opening live availability & pricing. Want me to set up a tour while you look?", chips: ['Schedule a tour', 'Apply now', 'Back'] }), 300); }
    else if (flow.action === 'call') { window.location.href = 'tel:6167378592'; }
    else if (flow.action === 'email') { window.location.href = 'mailto:makennak@gulkergroup.com'; }
    else if (flow.action === 'back') { setTimeout(() => botSay(FLOWS.start), 250); }
  }

  async function handleText(text) {
    if (capture === 'name') { lead.name = text; capture = 'phone'; setTimeout(() => botSay({ msg: `Nice to meet you, ${text}! 👋 What's the best phone number?` }), 350); return; }
    if (capture === 'phone') { lead.phone = text; capture = 'email'; setTimeout(() => botSay({ msg: "Got it! And your email so we can send details & availability?" }), 350); return; }
    if (capture === 'email') { lead.email = text; capture = null; submitLead(); return; }

    const kw = KEYWORDS.find((k) => k.re.test(text));
    if (kw) { handleChip(kw.flow); return; }

    // AI fallback (optional — only if the Worker proxy is configured)
    if (!AI_PROXY_URL.includes('YOURSUBDOMAIN')) {
      typing(true);
      const reply = await askAI(text);
      typing(false);
      if (reply) { botSay({}, reply); return; }
    }
    botSay({ msg: "Good question! For the most accurate answer, call (616) 737-8592 — or pick an option below.", chips: ['Pricing & availability', 'Current specials 🎉', 'Schedule a tour', 'Call us'] });
  }

  async function askAI(text) {
    aiHistory.push({ role: 'user', content: text });
    try {
      const r = await fetch(AI_PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'system', content: KNOWLEDGE }, ...aiHistory], max_tokens: 200, temperature: 0.7 }) });
      if (!r.ok) return null;
      const data = await r.json();
      const reply = data.choices?.[0]?.message?.content || null;
      if (reply) aiHistory.push({ role: 'assistant', content: reply });
      if (aiHistory.length > 12) aiHistory = aiHistory.slice(-12);
      return reply;
    } catch (e) { return null; }
  }

  function typing(on) {
    let t = document.getElementById('chatTyping');
    if (on && !t) { t = el('chat-msg bot', 'Typing…'); t.id = 'chatTyping'; t.style.opacity = '.6'; body.appendChild(t); scroll(); }
    else if (!on && t) { t.remove(); }
  }

  async function submitLead() {
    const first = lead.name.split(' ')[0];
    const hasEmail = lead.email && lead.email.includes('@');
    botSay({ msg: `You're all set, ${first}! ✅ ${hasEmail ? `We'll email ${lead.email} and ` : ''}follow up at ${lead.phone} to confirm your ${lead.intent.toLowerCase()}.\n\n🎉 One month free — limited-time offer!`, chips: ['Back to menu'] });
    FLOWS['Back to menu'] = FLOWS.Back;
    try {
      await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: lead.name, phone: lead.phone, email: lead.email, intent: lead.intent, entry: 'chat:' + location.pathname, source: 'website_chat' }) });
    } catch (e) { /* lead still confirmed to user */ }
  }

  function toggle(force) {
    open = force !== undefined ? force : !open;
    panel.classList.toggle('is-open', open);
    if (open && !started) { started = true; setTimeout(() => botSay(FLOWS.start), 250); }
  }

  fab.addEventListener('click', () => toggle());
  document.getElementById('chatClose').addEventListener('click', () => toggle(false));
  document.getElementById('chatSend').addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
  function send() { const t = input.value.trim(); if (!t) return; input.value = ''; userSay(t); handleText(t); }
})();
