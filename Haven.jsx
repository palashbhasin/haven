const { useState, useEffect } = React;

// Inline SVG icon set (replaces lucide-react)
const makeIcon = (paths) => ({ className = '', strokeWidth = 2, style = {} }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    {paths}
  </svg>
);
const Shield = makeIcon(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />);
const AlertTriangle = makeIcon(<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>);
const CheckCircle2 = makeIcon(<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>);
const ArrowRight = makeIcon(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>);
const Loader2 = makeIcon(<path d="M21 12a9 9 0 1 1-6.219-8.56"/>);
const Eye = makeIcon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>);
const Lock = makeIcon(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>);
const Inbox = makeIcon(<><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>);

const Haven = () => {
  const [activeScenario, setActiveScenario] = useState(null);
  const [bannerShown, setBannerShown] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [joined, setJoined] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [havenOnInbox, setHavenOnInbox] = useState(true);

  const scenarios = [
    {
      id: 'usps',
      type: 'scam',
      channel: 'Text',
      sender: 'USPS Delivery',
      avatarInitials: 'US',
      timeLabel: 'now',
      label: 'Fake USPS delivery',
      preview: '"Your package cannot be delivered..."',
      bodyText: 'USPS: Your package cannot be delivered due to missing address info. Please update here: usps-redelivery.info/track  Reply Y to confirm.',
      bannerText: "Don't tap the link. Real USPS never texts for address info.",
    },
    {
      id: 'puppy',
      type: 'scam',
      channel: 'Email',
      sender: 'Happy Tails Breeders',
      avatarInitials: '🐾',
      timeLabel: '3:22 PM',
      label: 'Puppy / pet scam',
      preview: '"Your new puppy is ready..."',
      bodyText: "Hi! Thank you for your interest in our Golden Retriever puppies. Bella is ready for her new home! She's been vet-checked and comes with all papers. Shipping is $450 via our special pet courier (cash or gift cards accepted for faster processing). Please send payment to secure her before other families take her.",
      bannerText: "This is a pet scam. Real breeders never ask for gift cards.",
    },
    {
      id: 'grandson',
      type: 'scam',
      channel: 'Text',
      sender: 'Unknown number',
      avatarInitials: '?',
      timeLabel: 'now',
      label: '"Grandson in trouble"',
      preview: '"Grandma please don\'t tell anyone..."',
      bodyText: "Grandma it's me. I got into an accident and I'm in jail. Please don't tell anyone. I need you to send $2,400 in gift cards right now so I can get out. Please hurry.",
      bannerText: "Common scam. Call your real grandson's number before doing anything.",
    },
    {
      id: 'amazon-scam',
      type: 'scam',
      channel: 'Email',
      sender: 'Amazon Security',
      avatarInitials: 'A',
      timeLabel: '8:47 AM',
      label: 'Fake Amazon charge',
      preview: '"$849 charged — call to reverse..."',
      bodyText: "Your order #302-8847 has shipped. $849.00 was charged to your card ending 4411. If you did not authorize this charge, call our fraud department at 1-888-555-0194 to reverse it.",
      bannerText: "That phone number is not Amazon. This is how they steal your card info.",
    },
    {
      id: 'amazon-real',
      type: 'safe',
      channel: 'Email',
      sender: 'Amazon.com',
      avatarInitials: 'a',
      timeLabel: '2:15 PM',
      label: 'Real Amazon shipping',
      preview: '"Your order has shipped..."',
      bodyText: "Hi, your order of 'Staedtler Pigment Liner Set' has shipped. Track your package in the Amazon app or at amazon.com/orders. Expected delivery: Tuesday. Thanks for shopping with us.",
      bannerText: "",
    },
    {
      id: 'pharmacy',
      type: 'safe',
      channel: 'Text',
      sender: 'Walgreens Rx',
      avatarInitials: 'W',
      timeLabel: '10:03 AM',
      label: 'Real pharmacy reminder',
      preview: '"Your prescription is ready..."',
      bodyText: "Walgreens: Your prescription is ready for pickup at the Maple Street store. Hours today: 8am-10pm. Reply STOP to opt out of text reminders.",
      bannerText: "",
    },
  ];

  const scamScenarios = scenarios.filter(s => s.type === 'scam');
  const safeScenarios = scenarios.filter(s => s.type === 'safe');

  const runScenario = async (scenario) => {
    setActiveScenario(scenario);
    setBannerShown(false);
    setVerdict(null);
    setError('');
    setLoading(true);
    if (scenario.type === 'scam') {
      setTimeout(() => setBannerShown(true), 850);
    }

    const systemPrompt = `You are Haven's scam detection engine. You protect people from scams, frauds, and phishing attempts.

Analyze the message below. Return ONLY a valid JSON object — no preamble, no markdown code fences, no commentary.

Schema:
{
  "verdict": "scam" | "suspicious" | "safe",
  "confidence": "high" | "medium" | "low",
  "headline": "one short sentence, plain English, no jargon",
  "explanation": "2-3 short sentences explaining why, written warmly like a kind family member. Simple words.",
  "action": "one specific concrete step to take right now",
  "red_flags": ["short", "phrases", "from the message that raised concern. Empty array if safe."]
}

Rules:
- Default to caution. If unsure, use "suspicious" not "safe".
- Legitimate messages from real companies (shipping notices, prescription reminders, appointment confirmations) should be "safe".
- Avoid jargon like "phishing", "credentials". Write plainly.
- Short sentences. Warm tone, not alarming.`;

    try {
      const text = await window.claude.complete({
        messages: [
          { role: "user", content: `${systemPrompt}\n\nMessage to analyze:\n"""\n${scenario.bodyText}\n"""` }
        ],
      });
      const clean = String(text).replace(/```json|```/g, '').trim();
      // Pull JSON object out even if model adds preamble
      const match = clean.match(/\{[\s\S]*\}/);
      setVerdict(JSON.parse(match ? match[0] : clean));
    } catch (e) {
      setError("Couldn't analyze right now. Try another scenario.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-play the first scam scenario so the demo isn't dead on arrival
  useEffect(() => {
    const t = setTimeout(() => {
      if (!activeScenario) runScenario(scamScenarios[0]);
    }, 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const joinWaitlist = async () => {
    if (!email.trim() || !email.includes('@') || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('https://formspree.io/f/xrerveyw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          reason: reason.trim() || 'not specified',
          _subject: `New Haven waitlist signup: ${email.trim()}`,
        }),
      });
      if (res.ok) {
        setJoined(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.errors?.[0]?.message || "Something went wrong. Try again in a moment.");
      }
    } catch (e) {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F1E8] text-[#1A1F1C]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=DM+Sans:opsz,wght@9..40,300..700&display=swap');
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        body, html, .font-body { font-family: 'DM Sans', sans-serif; }
        .grain {
          background-image: radial-gradient(circle at 1px 1px, rgba(26,31,28,0.05) 1px, transparent 0);
          background-size: 28px 28px;
        }
        @keyframes slideDown { from { transform: translateY(-16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes slow-pulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.15); opacity: 0.7; } }
        .anim-slide-down { animation: slideDown 0.55s cubic-bezier(0.2,0.8,0.2,1) both; }
        .anim-fade-up { animation: fadeUp 0.55s cubic-bezier(0.2,0.8,0.2,1) both; }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .slow-pulse { animation: slow-pulse 3s ease-in-out infinite; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.25s; }
        .delay-3 { animation-delay: 0.4s; }
      `}</style>

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#F5F1E8]/85 border-b border-[#1A1F1C]/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#2D4A3E] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#F5F1E8]" strokeWidth={2.2} />
            </div>
            <span className="font-display text-2xl font-medium tracking-tight">Haven</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#demo-section" className="hidden sm:block text-sm text-[#1A1F1C]/70 hover:text-[#1A1F1C]">How it works</a>
            <a href="#waitlist" className="text-[14px] font-medium px-5 py-2.5 rounded-full bg-[#1A1F1C] text-[#F5F1E8] hover:bg-[#2D4A3E] transition-colors">
              Join waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* HERO — credibility-honest version */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain opacity-70 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-28 grid md:grid-cols-[1.1fr_1fr] gap-12 md:gap-20 items-center relative">
          <div>
            <div className="anim-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1F1C]/5 text-[#1A1F1C]/70 text-[11px] tracking-[0.12em] mb-8 border border-[#1A1F1C]/10">
              <span>SOLO-BUILT · AFTER I GOT SCAMMED</span>
            </div>
            <h1 className="anim-fade-up delay-1 font-display text-5xl md:text-6xl lg:text-7xl font-light leading-[1.02] tracking-tight mb-8">
              Stop scams before<br />
              <span className="italic font-normal text-[#2D4A3E]">they reach your family.</span>
            </h1>
            <p className="anim-fade-up delay-2 text-lg text-[#1A1F1C]/70 leading-relaxed max-w-lg mb-6">
              Every scam-protection app assumes your parent will spot the scam in time. Haven doesn't. We watch their inbox quietly and flag scams before they have a chance to cause harm.
            </p>
            <p className="anim-fade-up delay-2 text-sm text-[#1A1F1C]/55 leading-relaxed max-w-lg mb-10 italic">
              Honest status: Gmail detection works in demos today. Real inboxes are next. I'm building this in the open — join early and help shape it.
            </p>
            <div className="anim-fade-up delay-3 flex flex-wrap items-center gap-3">
              <a href="#waitlist" className="group inline-flex items-center gap-2 text-[15px] font-medium px-6 py-3.5 rounded-full bg-[#1A1F1C] text-[#F5F1E8] hover:bg-[#2D4A3E] transition-colors">
                Get early access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a href="#demo-section" className="inline-flex items-center gap-2 text-[15px] font-medium px-6 py-3.5 rounded-full border border-[#1A1F1C]/20 hover:border-[#1A1F1C]/50 transition-colors">
                See it in action
              </a>
            </div>
          </div>
          <div className="relative flex justify-center md:justify-end">
            <HeroPhone />
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="bg-[#1A1F1C] text-[#F5F1E8] py-24 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-[11px] tracking-[0.2em] text-[#C97B5A] mb-6">WHY I'M BUILDING THIS</div>
          <h2 className="font-display text-3xl md:text-4xl font-light leading-tight mb-8">
            A few weeks ago, I got scammed trying to buy a puppy online.
          </h2>
          <div className="space-y-5 text-[#F5F1E8]/80 text-lg leading-relaxed">
            <p>
              It was my favorite breed. The photos looked real. The seller sounded nice. I'd been saving for months. By the time I realized what was happening, it was too late.
            </p>
            <p>
              What hurt wasn't just the money — it was how <span className="italic text-[#F5F1E8]">easy</span> it was to be fooled. If it could happen to me, it could happen to anyone in my family.
            </p>
            <p>
              Every existing scam app assumes the victim will recognize the scam in the moment. But that's not how scams work. By design, they don't <span className="italic">feel</span> like scams until it's too late.
            </p>
            <p className="font-display text-xl text-[#F5F1E8] italic pt-3">
              So I'm building Haven. An AI that watches quietly, and speaks up before someone gets hurt.
            </p>
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo-section" className="bg-[#EFE9DD] py-24 relative">
        <div className="absolute inset-0 grain opacity-50 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-[11px] tracking-[0.2em] text-[#2D4A3E] mb-6">WATCH IT HAPPEN</div>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight mb-4">
            See Haven at work.<br />
            <span className="italic">Live AI. Real messages.</span>
          </h2>
          <p className="text-[#1A1F1C]/60 text-lg mb-10 max-w-2xl">
            Some of these are real. Some are scams. Pick any one — Haven has to figure it out with no cheating.
          </p>

          {/* Labeled rows: Scams vs Real */}
          <div className="space-y-5 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#B8352A]" strokeWidth={2.5} />
                <span className="text-[10px] tracking-[0.18em] font-semibold text-[#B8352A]">SCAMS</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {scamScenarios.map((s) => {
                  const active = activeScenario?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => runScenario(s)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-[#1A1F1C] text-[#F5F1E8] border-[#1A1F1C] shadow-md'
                          : 'bg-white border-[#B8352A]/15 hover:border-[#B8352A] hover:-translate-y-0.5'
                      }`}
                    >
                      <div className={`text-[10px] tracking-wider mb-1 ${active ? 'text-[#C97B5A]' : 'text-[#1A1F1C]/40'}`}>
                        {s.channel.toUpperCase()}
                      </div>
                      <div className="font-medium text-[14px] leading-tight">{s.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4A3E]" strokeWidth={2.5} />
                <span className="text-[10px] tracking-[0.18em] font-semibold text-[#2D4A3E]">REAL MESSAGES</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {safeScenarios.map((s) => {
                  const active = activeScenario?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => runScenario(s)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-[#1A1F1C] text-[#F5F1E8] border-[#1A1F1C] shadow-md'
                          : 'bg-white border-[#2D4A3E]/15 hover:border-[#2D4A3E] hover:-translate-y-0.5'
                      }`}
                    >
                      <div className={`text-[10px] tracking-wider mb-1 ${active ? 'text-[#C97B5A]' : 'text-[#1A1F1C]/40'}`}>
                        {s.channel.toUpperCase()}
                      </div>
                      <div className="font-medium text-[14px] leading-tight">{s.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[320px_1fr] gap-8 lg:gap-12 items-start">
            <div className="flex justify-center md:justify-start">
              <ScenarioPhone scenario={activeScenario} bannerShown={bannerShown} />
            </div>
            <div className="min-h-[200px]">
              {!activeScenario && (
                <div className="p-8 rounded-2xl border border-dashed border-[#1A1F1C]/15 text-center text-sm text-[#1A1F1C]/50 bg-white/40">
                  Tap any message above to see Haven's live AI analysis.
                </div>
              )}
              {loading && (
                <div className="p-6 rounded-2xl bg-white border border-[#1A1F1C]/10 flex items-center gap-3 text-sm text-[#1A1F1C]/60 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[#2D4A3E]" />
                  Haven is analyzing...
                </div>
              )}
              {error && (
                <div className="p-4 rounded-2xl bg-[#B8352A]/10 text-[#B8352A] text-sm">{error}</div>
              )}
              {verdict && !loading && (
                <div className="anim-fade-up">
                  <VerdictCard verdict={verdict} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — dramatic before/after */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="text-[11px] tracking-[0.2em] text-[#2D4A3E]">HOW IT WORKS</div>
            <div className="text-[10px] tracking-wider text-[#C97B5A] px-2 py-0.5 rounded-full bg-[#C97B5A]/10">GMAIL FIRST</div>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight mb-4 max-w-3xl">
            You set it up once.<br />
            <span className="italic">Their inbox gets safer forever.</span>
          </h2>
          <p className="text-[#1A1F1C]/60 text-lg mb-14 max-w-2xl">
            Haven connects to a parent's Gmail with their permission. No app to install. No password shared. Watch what a typical inbox looks like — with and without Haven.
          </p>

          <div className="bg-white rounded-3xl border border-[#1A1F1C]/10 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-[#1A1F1C]/10 flex items-center justify-between flex-wrap gap-3 bg-[#F5F1E8]/60">
              <div className="flex items-center gap-3">
                <Inbox className="w-5 h-5 text-[#1A1F1C]/50" strokeWidth={1.8} />
                <div>
                  <div className="text-[11px] tracking-[0.15em] text-[#1A1F1C]/40">INBOX PREVIEW</div>
                  <div className="font-display text-lg">linda.t@gmail.com</div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#1A1F1C]/5 rounded-full p-1 border border-[#1A1F1C]/10">
                <button
                  onClick={() => setHavenOnInbox(false)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!havenOnInbox ? 'bg-white text-[#1A1F1C] shadow-sm' : 'text-[#1A1F1C]/50 hover:text-[#1A1F1C]'}`}
                >
                  Without Haven
                </button>
                <button
                  onClick={() => setHavenOnInbox(true)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${havenOnInbox ? 'bg-[#2D4A3E] text-white shadow-sm' : 'text-[#1A1F1C]/50 hover:text-[#1A1F1C]'}`}
                >
                  With Haven
                </button>
              </div>
            </div>

            <InboxList havenOn={havenOnInbox} />

            <div className="px-6 py-4 border-t border-[#1A1F1C]/10 bg-[#F5F1E8]/40 text-center text-xs text-[#1A1F1C]/60">
              {havenOnInbox
                ? <span><span className="text-[#2D4A3E] font-medium">3 scams caught.</span> The real mail she cares about is right up top.</span>
                : <span>Without Haven, every message looks equally trustworthy — and the scams sit right next to a note from her daughter.</span>}
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <SmallFeature icon={Lock} title="Read-only access" body="Haven can only read incoming mail. We can't send, delete, or change anything." />
            <SmallFeature icon={Eye} title="Private by design" body="Messages are checked and the verdict comes back. We don't store the contents." />
            <SmallFeature icon={Shield} title="Turn off anytime" body="One tap in Google account settings removes Haven completely. Total control." />
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="bg-[#1A1F1C] text-[#F5F1E8] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-[11px] tracking-[0.2em] text-[#C97B5A] mb-6">HONEST ROADMAP</div>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight mb-12 max-w-2xl">
            What's being built,<br /><span className="italic">and what's next.</span>
          </h2>
          <div className="space-y-6">
            <RoadmapRow status="now" label="Now" title="Gmail scam detection" body="AI-powered scam flagging inside any Gmail inbox. In active development." />
            <RoadmapRow status="next" label="Next" title="Family dashboard" body="Weekly summary of what Haven caught for your parent, sent to you." />
            <RoadmapRow status="later" label="Later" title="Puppy & marketplace scams" body="Reverse image search on listings. Catches stolen photos used by fake breeders." />
            <RoadmapRow status="later" label="Later" title="Text message protection" body="Android first (iOS is harder). Intercept scam texts in the Messages app." />
            <RoadmapRow status="later" label="Someday" title="Phone call screening" body="Unknown callers answered by AI first. Only real ones ring through." />
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="bg-[#F5F1E8] py-24 relative">
        <div className="absolute inset-0 grain opacity-70 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-6 text-center relative">
          <div className="text-[11px] tracking-[0.2em] text-[#2D4A3E] mb-6">EARLY ACCESS</div>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight mb-6">
            Be one of the first<br />
            <span className="italic">to try Haven.</span>
          </h2>
          <p className="text-[#1A1F1C]/70 text-lg mb-10 max-w-lg mx-auto">
            Early users get free lifetime access and help shape what gets built next.
          </p>

          {!joined ? (
            <div className="space-y-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-5 py-3.5 rounded-full border border-[#1A1F1C]/15 focus:border-[#2D4A3E] focus:outline-none text-[15px] bg-white"
              />
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional: who are you trying to protect?"
                className="w-full px-5 py-3.5 rounded-full border border-[#1A1F1C]/15 focus:border-[#2D4A3E] focus:outline-none text-[15px] bg-white"
              />
              <button
                onClick={joinWaitlist}
                disabled={submitting || !email.includes('@')}
                className="w-full inline-flex items-center justify-center gap-2 text-[15px] font-medium px-6 py-3.5 rounded-full bg-[#1A1F1C] text-[#F5F1E8] hover:bg-[#2D4A3E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <>Claim my spot <ArrowRight className="w-4 h-4" /></>}
              </button>
              {error && <div className="text-[#B8352A] text-sm">{error}</div>}
            </div>
          ) : (
            <div className="anim-fade-up bg-white rounded-2xl p-8 border border-[#2D4A3E]/20 shadow-lg max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#2D4A3E] flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div className="font-display text-2xl mb-2">You're in.</div>
              <div className="text-sm text-[#1A1F1C]/60">
                We'll email <span className="text-[#1A1F1C] font-medium">{email}</span> when Haven is ready.
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-center gap-5 text-xs text-[#1A1F1C]/40 flex-wrap">
            <span className="inline-flex items-center gap-1.5"><Lock className="w-3 h-3" /> Email only used for early access</span>
            <span>·</span>
            <span>No spam</span>
            <span>·</span>
            <span>Unsubscribe anytime</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1A1F1C]/10 py-10 bg-[#F5F1E8]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#1A1F1C]/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2D4A3E] flex items-center justify-center">
              <Shield className="w-3 h-3 text-[#F5F1E8]" strokeWidth={2.2} />
            </div>
            <span className="font-display text-lg text-[#1A1F1C]">Haven</span>
          </div>
          <div>Built with care. For the people who raised us.</div>
        </div>
      </footer>
    </div>
  );
};

// ---- Components ----

const HeroPhone = () => {
  const [bannerIn, setBannerIn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBannerIn(true), 1100);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative w-[280px] h-[560px] rounded-[44px] bg-[#1A1F1C] p-3 shadow-2xl">
      <div className="w-full h-full rounded-[34px] bg-white overflow-hidden relative">
        <div className="flex justify-between items-center px-6 pt-4 pb-2 text-[11px] text-[#1A1F1C] font-medium">
          <span>9:41</span><span>●●●●●</span>
        </div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1A1F1C] rounded-full" />
        <div className="px-5 pt-4 pb-3 border-b border-neutral-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium">US</div>
          <div className="flex-1">
            <div className="text-sm font-medium">USPS Delivery</div>
            <div className="text-[11px] text-neutral-500">now</div>
          </div>
        </div>
        {bannerIn && (
          <div className="mx-3 mt-3 anim-slide-down">
            <div className="bg-[#B8352A] text-white rounded-xl p-3 shadow-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.15em] mb-0.5 opacity-90">HAVEN · LIKELY SCAM</div>
                  <div className="text-sm font-medium leading-snug">Don't tap the link. Real USPS never texts for address info.</div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="px-4 pt-3">
          <div className={`bg-neutral-100 rounded-2xl rounded-tl-md p-3 max-w-[85%] text-[13px] ${bannerIn ? 'text-neutral-400' : 'text-neutral-700'}`}>
            USPS: Your package cannot be delivered due to missing address info. Please update here: usps-redelivery.info/track
          </div>
          <div className="text-[10px] text-neutral-400 pl-2 mt-1.5">Text · 8:47 AM</div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-2 bg-white rounded-xl px-4 py-2.5 shadow-lg border border-[#1A1F1C]/5 hidden md:block">
        <div className="text-[10px] tracking-wider text-[#1A1F1C]/50">INTERCEPTED</div>
        <div className="text-xs font-medium">Before she tapped</div>
      </div>
    </div>
  );
};

const ScenarioPhone = ({ scenario, bannerShown }) => (
  <div className="relative w-[300px] h-[580px] rounded-[44px] bg-[#1A1F1C] p-3 shadow-2xl">
    <div className="w-full h-full rounded-[36px] bg-white overflow-hidden relative flex flex-col">
      <div className="flex justify-between items-center px-7 pt-4 pb-2 text-[11px] text-[#1A1F1C] font-medium z-10">
        <span>9:41</span><span>●●●●●</span>
      </div>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1A1F1C] rounded-full z-20" />

      {!scenario ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center pt-8">
          <div className="relative flex items-center justify-center">
            <div className="slow-pulse absolute w-20 h-20 rounded-full bg-[#2D4A3E]/20" />
            <div className="relative w-14 h-14 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#2D4A3E]" strokeWidth={1.8} />
            </div>
          </div>
          <div className="font-display text-lg text-[#1A1F1C]/80 leading-tight mt-2">Haven is watching quietly.</div>
          <div className="text-xs text-[#1A1F1C]/50 leading-relaxed max-w-[200px]">A message is about to come in...</div>
        </div>
      ) : (
        <>
          <div className="px-5 pt-3 pb-3 border-b border-neutral-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-[14px] text-neutral-600">
              {scenario.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{scenario.sender}</div>
              <div className="text-[11px] text-neutral-500">{scenario.channel} · {scenario.timeLabel}</div>
            </div>
          </div>
          {bannerShown && scenario.type === 'scam' && (
            <div className="mx-3 mt-3 anim-slide-down">
              <div className="bg-[#B8352A] text-white rounded-xl p-3 shadow-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.15em] mb-0.5 opacity-90">HAVEN · LIKELY SCAM</div>
                    <div className="text-[13px] font-medium leading-snug">{scenario.bannerText}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div key={scenario.id} className="px-4 pt-3 anim-fade-up overflow-y-auto">
            <div className={`rounded-2xl rounded-tl-md p-3.5 max-w-[92%] text-[13px] leading-relaxed transition-opacity ${bannerShown && scenario.type === 'scam' ? 'bg-neutral-100 text-neutral-400' : 'bg-neutral-100 text-neutral-700'}`}>
              {scenario.bodyText}
            </div>
            <div className="text-[10px] text-neutral-400 pl-2 mt-1.5 pb-4">
              {scenario.channel} · {scenario.timeLabel}
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);

const VerdictCard = ({ verdict }) => {
  const config = {
    scam:       { bg: '#B8352A', icon: AlertTriangle, label: 'LIKELY SCAM' },
    suspicious: { bg: '#C97B5A', icon: AlertTriangle, label: 'BE CAREFUL' },
    safe:       { bg: '#2D4A3E', icon: CheckCircle2,  label: 'LOOKS SAFE' },
  };
  const c = config[verdict.verdict] || config.suspicious;
  const Icon = c.icon;
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#1A1F1C]/10 shadow-lg">
      <div className="p-5 flex items-center gap-3" style={{ backgroundColor: c.bg }}>
        <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
        <div className="text-white">
          <div className="text-[10px] tracking-[0.15em] opacity-80">HAVEN · {c.label}</div>
          <div className="text-lg font-medium leading-tight">{verdict.headline}</div>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <div className="text-[10px] tracking-wider text-[#1A1F1C]/40 mb-2">WHY</div>
          <p className="text-[15px] leading-relaxed text-[#1A1F1C]/80">{verdict.explanation}</p>
        </div>
        <div>
          <div className="text-[10px] tracking-wider text-[#1A1F1C]/40 mb-2">WHAT TO DO</div>
          <p className="text-[15px] leading-relaxed text-[#1A1F1C] font-medium">{verdict.action}</p>
        </div>
        {verdict.red_flags?.length > 0 && (
          <div>
            <div className="text-[10px] tracking-wider text-[#1A1F1C]/40 mb-2">WARNING SIGNS</div>
            <div className="flex flex-wrap gap-2">
              {verdict.red_flags.map((f, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#B8352A]/10 text-[#B8352A]">{f}</span>
              ))}
            </div>
          </div>
        )}
        <div className="text-[10px] text-[#1A1F1C]/30 pt-3 border-t border-[#1A1F1C]/10">
          Confidence: {verdict.confidence}. Always contact the company directly if unsure.
        </div>
      </div>
    </div>
  );
};

// Inbox with dramatic before/after behavior
const InboxList = ({ havenOn }) => {
  const messages = [
    { id: 'amzn',   from: 'Amazon Security',        subject: 'Your order #302-8847 has shipped',            preview: 'A charge of $849.00 was made to your card ending 4411. If you did not authorize this, call 1-888...', time: '9:14 AM',  flag: 'scam' },
    { id: 'irs',    from: 'IRS Online Services',    subject: 'Final notice: tax penalty owed',              preview: 'You owe $2,847.13 in unpaid taxes. To avoid arrest, settle today at irs-payment-portal.net...',   time: '8:30 AM',  flag: 'scam' },
    { id: 'sarah',  from: 'Sarah (your daughter)',  subject: "Pictures from the grandkids' soccer game!",   preview: "Hi, here are the photos I promised. Look at Henry's goal celebration...",                         time: '7:52 AM',  flag: null   },
    { id: 'chase',  from: 'Chase Bank',             subject: 'Action required on your account',             preview: "We've detected unusual activity. Please verify your identity by clicking...",                      time: 'Yesterday', flag: 'suspect' },
    { id: 'walg',   from: 'Walgreens Pharmacy',     subject: 'Your prescription is ready for pickup',       preview: 'Your prescription for Lisinopril is ready at the Maple Street location...',                       time: 'Yesterday', flag: null   },
  ];

  // With Haven: float safe mail to top, dim flagged mail underneath
  const ordered = havenOn
    ? [...messages].sort((a, b) => (a.flag ? 1 : 0) - (b.flag ? 1 : 0))
    : messages;

  return (
    <div>
      {ordered.map((m) => (
        <InboxRow
          key={m.id}
          from={m.from}
          subject={m.subject}
          preview={m.preview}
          time={m.time}
          havenFlag={havenOn ? m.flag : null}
          havenOn={havenOn}
        />
      ))}
    </div>
  );
};

const InboxRow = ({ from, subject, preview, time, havenFlag, havenOn }) => {
  const flagConfig = {
    scam: { color: '#B8352A', label: 'LIKELY SCAM' },
    suspect: { color: '#C97B5A', label: 'BE CAREFUL' },
  };
  const flag = havenFlag ? flagConfig[havenFlag] : null;
  const dimmed = havenOn && !!flag;

  return (
    <div
      className={`px-6 py-4 border-b border-[#1A1F1C]/5 last:border-0 transition-all ${
        dimmed ? 'bg-[#1A1F1C]/[0.03] opacity-60' : 'hover:bg-[#F5F1E8]/30'
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-1">
        <div className={`text-sm font-medium truncate flex-1 ${dimmed ? 'line-through text-[#1A1F1C]/50' : ''}`}>{from}</div>
        <div className="text-xs text-[#1A1F1C]/40 flex-shrink-0">{time}</div>
      </div>
      {flag && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: flag.color }} strokeWidth={2.5} />
          <span className="text-[10px] tracking-[0.1em] font-semibold" style={{ color: flag.color }}>HAVEN · {flag.label}</span>
        </div>
      )}
      <div className={`text-sm truncate ${dimmed ? 'line-through text-[#1A1F1C]/40' : 'text-[#1A1F1C]'}`}>{subject}</div>
      <div className={`text-xs truncate mt-0.5 ${dimmed ? 'text-[#1A1F1C]/30' : 'text-[#1A1F1C]/50'}`}>{preview}</div>
    </div>
  );
};

const SmallFeature = ({ icon: Icon, title, body }) => (
  <div className="border-t border-[#1A1F1C]/10 pt-5">
    <Icon className="w-5 h-5 text-[#2D4A3E] mb-3" strokeWidth={1.7} />
    <div className="font-medium mb-1.5">{title}</div>
    <div className="text-sm text-[#1A1F1C]/60 leading-relaxed">{body}</div>
  </div>
);

const RoadmapRow = ({ status, label, title, body }) => {
  const statusConfig = {
    now:   { color: '#C97B5A', bg: 'bg-[#C97B5A]/15' },
    next:  { color: '#F5F1E8', bg: 'bg-[#F5F1E8]/10' },
    later: { color: '#F5F1E8', bg: 'bg-[#F5F1E8]/5' },
  };
  const c = statusConfig[status] || statusConfig.later;
  return (
    <div className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-6 items-start pb-6 border-b border-[#F5F1E8]/10 last:border-0">
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${c.bg} text-[10px] tracking-[0.15em] font-semibold w-fit`} style={{ color: c.color }}>
        {label.toUpperCase()}
      </div>
      <div>
        <div className="font-display text-xl mb-1">{title}</div>
        <div className="text-[#F5F1E8]/60 leading-relaxed">{body}</div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Haven />);
