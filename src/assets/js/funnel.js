// ---- Multi-step lead funnel (tour + application) ----
const LEAD_ENDPOINT = 'https://larbpeheccgzaejtiaiv.supabase.co/functions/v1/submit-msf-lead';

document.querySelectorAll('[data-funnel]').forEach((root) => {
  const steps = Array.from(root.querySelectorAll('[data-step]'));
  const numbered = steps.filter((s) => s.dataset.step !== 'success');
  const successStep = root.querySelector('[data-step="success"]');
  const dots = Array.from(root.querySelectorAll('.steps__dot'));
  const lead = { bedrooms: '', timeline: '', firstName: '', lastName: '', phone: '', email: '' };
  let idx = 0;

  const show = (i) => {
    steps.forEach((s) => s.classList.remove('is-active'));
    numbered[i].classList.add('is-active');
    dots.forEach((d, di) => d.classList.toggle('is-done', di <= i));
    idx = i;
    const firstInput = numbered[i].querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 60);
  };

  // choice chips
  root.querySelectorAll('.choices').forEach((group) => {
    const field = group.dataset.field;
    group.querySelectorAll('.choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.choice').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        lead[field] = btn.dataset.value;
        if (idx < numbered.length - 1) setTimeout(() => show(idx + 1), 180);
      });
    });
  });

  // back
  root.querySelectorAll('[data-back]').forEach((b) =>
    b.addEventListener('click', () => show(Math.max(0, idx - 1)))
  );

  // submit
  const submitBtn = root.querySelector('[data-submit]');
  submitBtn && submitBtn.addEventListener('click', async () => {
    lead.firstName = (root.querySelector('[name=firstName]').value || '').trim();
    lead.lastName = (root.querySelector('[name=lastName]').value || '').trim();
    lead.phone = (root.querySelector('[name=phone]').value || '').trim();
    lead.email = (root.querySelector('[name=email]').value || '').trim();
    const bedSel = root.querySelector('[name=bedrooms]');
    if (bedSel && bedSel.value) lead.bedrooms = bedSel.value;

    if (!lead.firstName) { root.querySelector('[name=firstName]').focus(); return; }
    if (lead.phone.replace(/\D/g, '').length < 10) { root.querySelector('[name=phone]').focus(); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const intent = `${root.dataset.intent} — ${lead.bedrooms || 'Unspecified'}, ${lead.timeline || 'n/a'}`;
    const handoff = root.dataset.handoff;

    // For the application funnel, open the handoff window synchronously (avoids popup blockers)
    let win = null;
    if (handoff) win = window.open(handoff, '_blank');

    try {
      await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${lead.firstName} ${lead.lastName}`.trim(),
          phone: lead.phone,
          email: lead.email,
          intent,
          entry: location.pathname,
          source: 'website_funnel',
        }),
      });
    } catch (e) { /* lead still confirmed to the user */ }

    // success screen
    steps.forEach((s) => s.classList.remove('is-active'));
    dots.forEach((d) => d.classList.add('is-done'));
    successStep.classList.add('is-active');
    const msg = successStep.querySelector('[data-success-msg]');
    if (msg) {
      msg.textContent = handoff
        ? `Thanks ${lead.firstName}! Your application is opening in a new tab.`
        : `Thanks ${lead.firstName}! We'll text ${lead.phone} shortly to confirm your tour. 🎉 Remember: one month free right now — limited time.`;
    }
    if (handoff && !win) {
      // popup was blocked — surface the manual link prominently
      const link = successStep.querySelector('[data-handoff-link]');
      if (link) link.textContent = 'Tap to open your application →';
    }
  });
});
