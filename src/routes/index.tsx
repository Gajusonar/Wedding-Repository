import { createFileRoute, useRouterState } from "@tanstack/react-router";
import lzString from "lz-string";
const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = lzString;
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, CalendarDays, Check, Copy, Heart, Link2, MapPin, Music2, Navigation, Pause, Play, Send, Settings2, Sparkles, Upload, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ceremony from "@/assets/ceremony-illustration.jpg";
import rituals from "@/assets/rituals-illustration.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Gajendra & Bhakti's Wedding Invitation | 12 February 2027, Amalner" },
    { name: "description", content: "Gajendra Sonar weds Bhakti on 12 February 2027 at 1:30 pm at The Hanuman Resort, Amalner, Maharashtra. Open your personal invitation." },
    { property: "og:title", content: "Gajendra & Bhakti are getting married — you're invited" },
    { property: "og:description", content: "Join us at The Hanuman Resort, Amalner, on Friday 12 February 2027 at 1:30 pm for a beautiful celebration of love." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: WeddingInvitation,
});

type Details = { partner1Title: string; partner1: string; partner2Title: string; partner2: string; date: string; time: string; venue: string; city: string; message: string; music: string; guest: string };
function normalizeAudioUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const fileIdFromPath = /\/d\/([a-zA-Z0-9_-]+)/.exec(trimmed);
  const fileIdFromQuery = /[?&]id=([a-zA-Z0-9_-]+)/.exec(trimmed);
  const fileId = fileIdFromPath?.[1] ?? fileIdFromQuery?.[1];

  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  return trimmed;
}

const starter: Details = {
  partner1Title: "Mr.", partner1: "Gajendra", partner2Title: "Miss.", partner2: "Bhakti", date: "2027-02-12", time: "13:30", venue: "The Hanuman Resort", city: "Amalner, Maharashtra",
  message: "तुमचे आशीर्वाद हाच आमचा खरा दागिना आणि तुमची उपस्थिती हीच आमची खरी भेट!", music: normalizeAudioUrl("https://drive.google.com/file/d/1bDn60k5zXN87phS7vcyfxUpSZRzzGyik/view?usp=sharing"), guest: "",
};
const fields: { key: keyof Details; label: string; placeholder: string; type?: string; span: string }[] = [
  { key: "partner1Title", label: "Title", placeholder: "Mr.", span: "col-span-2" }, { key: "partner1", label: "First name", placeholder: "Gajendra", span: "col-span-4" },
  { key: "partner2Title", label: "Title", placeholder: "Miss.", span: "col-span-2" }, { key: "partner2", label: "Second name", placeholder: "Bhakti", span: "col-span-4" },
  { key: "date", label: "Wedding date", placeholder: "", type: "date", span: "col-span-3" }, { key: "time", label: "Ceremony time", placeholder: "", type: "time", span: "col-span-3" },
  { key: "venue", label: "Venue name", placeholder: "The Hanuman Resort", span: "col-span-6" }, { key: "city", label: "City / address", placeholder: "Amalner, Maharashtra", span: "col-span-6" },
];

const venueSpot = { lat: 21.04775, lng: 75.054226 };
const venueMap = `https://www.google.com/maps?q=${venueSpot.lat},${venueSpot.lng}&z=16&output=embed`;
const venuePlace = `https://www.google.com/maps/search/?api=1&query=${venueSpot.lat},${venueSpot.lng}`;
const venueDirections = `https://www.google.com/maps/dir/?api=1&destination=${venueSpot.lat},${venueSpot.lng}`;
// Opens the map in a new tab; if the browser or preview blocks new tabs, loads it here instead.
function openMap(url: string) {
  const tab = window.open(url, "_blank", "noopener,noreferrer");
  if (tab && !tab.closed) return;
  try {
    const top = window.top;
    if (top) { top.location.href = url; return; }
  } catch { /* preview frame can't navigate its parent */ }
  window.location.href = url;
}
function mapLink(url: string, className: string, children: ReactNode) {
  return <a href={url} className={className} onClick={(e) => { e.preventDefault(); openMap(url); }}>{children}</a>;
}
function displayDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "Your special day" : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
}
function weekday(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(date);
}
function displayTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})/.exec(value || "");
  if (!match) return value || "";
  const date = new Date(2026, 0, 1, Number(match[1]), Number(match[2]));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}
const withTitle = (title: string, name: string) => [title.trim(), name.trim()].filter(Boolean).join(" ");
const coupleNames = (details: Details) => `${withTitle(details.partner1Title, details.partner1)} & ${withTitle(details.partner2Title, details.partner2)}`;
function makeLink(details: Details, guest: string) {
  const url = new URL(window.location.origin + window.location.pathname);
  // Only pack what differs from the starter — unchanged fields stay out of the link.
  const changed = (Object.keys(starter) as (keyof Details)[]).filter(key => key !== "guest" && details[key] !== starter[key]);
  if (changed.length) url.searchParams.set("d", compressToEncodedURIComponent(JSON.stringify(Object.fromEntries(changed.map(key => [key, details[key]])))));
  if (guest.trim()) url.searchParams.set("guest", guest.trim());
  url.searchParams.set("invite", "1");
  return url.toString();
}
function WeddingInvitation() {
  const sharedInvite = useRouterState({ select: state => new URLSearchParams(state.location.searchStr).get("invite") === "1" });
  const [details, setDetails] = useState<Details>(starter);
  const [guestMode, setGuestMode] = useState(sharedInvite);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false); // controls envelope opening animation
  const [copied, setCopied] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [uploadedMusic, setUploadedMusic] = useState("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const sfxCtxRef = useRef<AudioContext | null>(null);
  const petalContainerRef = useRef<HTMLDivElement | null>(null);

  function spawnPetalBurst() {
    try {
      const container = petalContainerRef.current;
      if (!container) return;
      const count = 18;
      const colors = ['text-rose','text-gold'];
      for (let i = 0; i < count; i++) {
        const el = document.createElement('span');
        el.className = `burst-petal absolute rounded-full ${colors[i % colors.length]}`;
        const left = 30 + Math.random() * 40; // center spread
        el.style.left = `${left}%`;
        el.style.top = `${40 + Math.random() * 20}%`;
        const scale = 0.7 + Math.random() * 0.7;
        el.style.width = `${8 * scale}px`;
        el.style.height = `${8 * scale}px`;
        el.style.transform = `translate3d(0,0,0) rotate(${Math.random()*360}deg)`;
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        container.appendChild(el);
        // stagger animation start
        const delay = Math.random() * 220;
        setTimeout(() => {
          el.classList.add('burst-animate');
        }, delay);
        // cleanup
        el.addEventListener('animationend', () => { el.remove(); });
      }
    } catch (e) { /* ignore */ }
  }

  function playPaperRustle() {
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
      if (!AC) return;
      const ctx = sfxCtxRef.current ?? new AC();
      sfxCtxRef.current = ctx;
      const sampleRate = ctx.sampleRate;
      const duration = 0.9; // seconds
      const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
      const data = buffer.getChannelData(0);
      // fill buffer with quick noise burst with a falling envelope
      for (let i = 0; i < data.length; i++) {
        const t = i / data.length;
        // denser noise at start, taper off
        data[i] = (Math.random() * 2 - 1) * (1 - Math.pow(t, 1.8)) * 0.9;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // create a bandpass + highpass to make it sound like paper rustle
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.8;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 250;
      const g = ctx.createGain();
      // gentle envelope: quick attack, medium decay
      const now = ctx.currentTime + 0.01;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.9, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.95);

      source.connect(bp);
      bp.connect(hp);
      hp.connect(g);
      g.connect(ctx.destination);

      source.start(now);
      source.stop(now + duration + 0.05);
    } catch (e) {
      // fail silently (some browsers block AudioContext without gesture)
      // console.warn('sfx failed', e);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("invite") === "1") {
      let overrides: Partial<Details> = {};
      const blob = params.get("d");
      if (blob) { try { overrides = JSON.parse(decompressFromEncodedURIComponent(blob) || "{}"); } catch { overrides = {}; } }
      // Legacy links carry plain field params — still honoured.
      const legacy = Object.fromEntries((Object.keys(starter) as (keyof Details)[]).filter(key => key !== "guest" && params.has(key)).map(key => [key, params.get(key) ?? ""]));
      setDetails({ ...starter, ...legacy, ...overrides, guest: params.get("guest") ?? "" });
      setGuestMode(true);
    }
  }, []);
  useEffect(() => {
    const update = () => {
      const target = new Date(`${details.date}T${details.time || "00:00"}:00`).getTime();
      setDaysLeft(Number.isNaN(target) ? null : Math.max(0, Math.ceil((target - Date.now()) / 86400000)));
    };
    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, [details.date, details.time]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    const elements = Array.from(document.querySelectorAll(".reveal-section"));
    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [guestMode, opened, details.date, details.time, details.partner1, details.partner2, details.guest]);

  useEffect(() => { return () => { if (uploadedMusic) URL.revokeObjectURL(uploadedMusic); }; }, [uploadedMusic]);

  const song = uploadedMusic || normalizeAudioUrl(details.music);
  const update = (key: keyof Details, value: string) => setDetails(prev => ({ ...prev, [key]: key === "music" ? normalizeAudioUrl(value) : value }));
  const toggleMusic = async () => {
    if (!audio.current || !song) return;
    if (musicPlaying) { audio.current.pause(); setMusicPlaying(false); }
    else { try { await audio.current.play(); setMusicPlaying(true); } catch { setMusicPlaying(false); } }
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(makeLink(details, details.guest)); setCopied(true); window.setTimeout(() => setCopied(false), 2500); } catch { setCopied(false); }
  };
  const whatsapp = () => {
    const greeting = details.guest.trim() ? `Dear ${details.guest.trim()}, ` : "";
    const text = `${greeting}You're invited to celebrate the wedding of ${coupleNames(details)}! 💍\n\n${displayDate(details.date)} at ${displayTime(details.time)}\n${details.venue}, ${details.city}\n\nOpen your invitation: ${makeLink(details, details.guest)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  const saveDate = () => {
    const stamp = details.date.replaceAll("-", "") + "T" + (details.time || "18:00").replace(":", "") + "00";
    const escape = (value: string) => value.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\n", "\\n");
    const calendar = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:${stamp}\r\nSUMMARY:${escape(coupleNames(details) + " Wedding")}\r\nLOCATION:${escape(details.venue + ", " + details.city)}\r\nDESCRIPTION:${escape(details.message)}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
    const href = URL.createObjectURL(new Blob([calendar], { type: "text/calendar" }));
    const link = document.createElement("a"); link.href = href; link.download = "wedding-invitation.ics"; link.click(); window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };
  const goEditor = () => { if (sharedInvite) return; setGuestMode(false); setOpened(false); setShareOpen(false); };

  return <main className="min-h-screen bg-background">
    <audio ref={audio} src={song || undefined} loop onEnded={() => setMusicPlaying(false)} onError={() => setMusicPlaying(false)} />
    {guestMode ? <>
      {!opened ? <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-5 py-8 text-center paper-texture">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} className={`float-petal petal-${i + 1} absolute top-0 text-rose`}>✿</span>)}</div>
        <p className="reveal-up warm-shimmer font-display text-2xl text-primary">॥ श्री गणेशाय नमः ॥</p>
        <div className="reveal-up reveal-delay relative mt-5 w-full max-w-[340px] sm:max-w-[400px]">
          <div className={`parallax-hero ambient-glow relative mx-auto aspect-[2/3] w-full overflow-hidden border-[6px] border-ivory bg-secondary invitation-stage sm:border-[9px] ${opening ? 'envelope-opening' : ''}`}>
            <div className={`cover-layer ${opening ? 'cover-opening' : ''}`} aria-hidden="true" />
            <div ref={petalContainerRef} className="petal-burst-container pointer-events-none absolute inset-0 z-50" aria-hidden="true" />
            <div className={`letter-inner ${opening ? 'letter-unfold' : ''} pointer-events-none absolute inset-0 z-30 ambient-layer-strong vignette`}>
              <div className="printed-page" aria-hidden={!opening && !opened}>
                <div className="names">{withTitle(details.partner1Title, details.partner1)}<span className="amp">&</span>{withTitle(details.partner2Title, details.partner2)}</div>
                <div className="meta">{weekday(details.date)} · {displayDate(details.date)} · {displayTime(details.time)}</div>
                <div className="message">{details.message}</div>
              </div>
            </div>
            <img src={ceremony} alt="Illustrated Hindu wedding mandap with marigolds, lamps and sacred fire" width={1024} height={1536} className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-x-[13%] top-[32%] flex h-[35%] flex-col items-center justify-center text-primary">
              <span className="font-display text-lg italic sm:text-xl">The wedding of</span>
              <p className="mt-2 font-display text-[clamp(1.8rem,8vw,3rem)] leading-[.95]">{withTitle(details.partner1Title, details.partner1)}<span className="my-1 block text-[.7em] italic text-gold">&</span>{withTitle(details.partner2Title, details.partner2)}</p>
              <span className="mt-4 font-sans text-[10px] font-semibold uppercase tracking-[0.17em]">{displayDate(details.date)}</span>
            </div>
            <div className="ritual-flame absolute bottom-[20%] left-1/2 h-9 w-9 -translate-x-1/2 rounded-full bg-gold/20 blur-md" aria-hidden="true" />
          </div>
        </div>
        <p className="reveal-up reveal-late mt-5 font-display text-xl italic text-foreground sm:text-2xl">{details.guest ? `For ${details.guest}` : "For someone very special"}</p>
        <Button variant="elegant" size="lg" className="reveal-up reveal-late mt-4 h-12 px-8" onClick={() => {
              // play a short envelope opening animation and sfx, then show the invitation
              playPaperRustle();
              setOpening(true);
              // Duration should match the CSS animation (1.1s). Use a timeout to reveal and spawn petals.
              window.setTimeout(() => { setOpened(true); setOpening(false); spawnPetalBurst(); window.scrollTo({ top: 0, behavior: "instant" }); }, 1100);
            }}>Open your invitation <ArrowRight /></Button>
      </div> : <div className="reveal-up"><Invitation details={details} daysLeft={daysLeft} guestMode onSaveDate={saveDate} /></div>}
      <div className="fixed bottom-5 right-5 z-30 flex gap-2">
        {song && <Button variant="delicate" size="icon" className="size-11 rounded-full shadow-lg" onClick={toggleMusic} aria-label={musicPlaying ? "Pause music" : "Play music"} title={musicPlaying ? "Pause music" : "Play music"}>{musicPlaying ? <Volume2 /> : <VolumeX />}</Button>}
        {!sharedInvite && <Button variant="delicate" size="icon" className="size-11 rounded-full shadow-lg" onClick={goEditor} aria-label="Edit invitation" title="Edit invitation"><Settings2 /></Button>}
      </div>
    </> : <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 lg:px-10">
          <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-full border border-gold text-gold"><Heart className="size-4" strokeWidth={1.5} /></span><span className="font-display text-[25px] font-semibold text-primary">Gajendra<span className="text-gold">.</span></span></div>
          <div className="flex items-center gap-2"><span className="hidden text-xs text-muted-foreground sm:block">Made for Gajendra</span><Button variant="elegant" size="sm" onClick={() => setShareOpen(true)}><Send /> <span className="hidden sm:inline">Share invitation</span><span className="sm:hidden">Share</span></Button></div>
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[minmax(360px,510px)_1fr]">
        <aside className="border-b border-border bg-ivory lg:border-b-0 lg:border-r lg:border-border">
          <div className="mx-auto max-w-[520px] px-6 py-9 md:px-10 lg:sticky lg:top-16 lg:max-h-[calc(100vh-64px)] lg:overflow-y-auto lg:px-11 lg:py-10">
            <div className="flex items-center gap-2 text-gold"><Sparkles className="size-4" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Your celebration starts here</span></div>
            <h1 className="mt-4 font-display text-5xl leading-[.95] text-ink md:text-6xl">Make it <em className="font-normal text-primary">yours.</em></h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">A little magic for your once-in-a-lifetime day. Fill in your details and watch your invitation come alive.</p>
            <div className="my-8 h-px w-full bg-border" />
            <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold text-ink">The happy details</h2><span className="font-display text-xl italic text-gold">01 / 03</span></div>
            <div className="mt-5 grid grid-cols-6 gap-4">{fields.map(field => <label key={field.key} className={`block ${field.span}`}><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{field.label}</span><input className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-gold focus:ring-1 focus:ring-gold" type={field.type || "text"} value={details[field.key]} placeholder={field.placeholder} onChange={e => update(field.key, e.target.value)} /></label>)}</div>
            <label className="mt-4 block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">A note from the heart</span><textarea className="min-h-20 w-full resize-y rounded-sm border border-border bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition focus:border-gold focus:ring-1 focus:ring-gold" value={details.message} maxLength={240} onChange={e => update("message", e.target.value)} /></label>
            <div className="my-7 h-px w-full bg-border" />
            <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold text-ink">Set the mood</h2><span className="font-display text-xl italic text-gold">02 / 03</span></div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Add a direct link to an MP3 file for guests, or upload a song to hear it in your own preview.</p>
            <div className="mt-4 flex gap-2"><div className="relative min-w-0 flex-1"><Music2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold" /><input aria-label="Music MP3 URL" className="h-11 w-full rounded-sm border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-gold focus:ring-1 focus:ring-gold" type="url" value={details.music} placeholder="https://example.com/your-song.mp3" onChange={e => { update("music", e.target.value); setMusicPlaying(false); }} /></div><input ref={uploadRef} type="file" accept="audio/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) { setUploadedMusic(URL.createObjectURL(file)); setMusicPlaying(false); } }} /><Button variant="outline" size="icon" className="size-11 shrink-0" title="Upload song for local preview" aria-label="Upload song for local preview" onClick={() => uploadRef.current?.click()}><Upload /></Button>{song && <Button variant="outline" size="icon" className="size-11 shrink-0" title={musicPlaying ? "Pause song" : "Play song"} aria-label={musicPlaying ? "Pause song" : "Play song"} onClick={toggleMusic}>{musicPlaying ? <Pause /> : <Play />}</Button>}<div className={`audio-visualizer ${musicPlaying ? "is-playing" : ""}`} aria-hidden="true">{[0,1,2,3,4].map(index => <span key={index} style={{ height: `${10 + index * 6}px` }} />)}</div></div>
            {uploadedMusic && <p className="mt-2 text-xs text-primary">Uploaded song plays here only. Add an MP3 link to include music in shared invitations.</p>}
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground"><span className="font-semibold text-gold">Marathi wedding songs to try:</span> Gauri Hruday · Palakane Aali Raja · Tuzya Navsanen · Karha Gala. Paste a direct MP3 link for the one you love.</p>
            <div className="my-7 h-px w-full bg-border" />
            <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold text-ink">Make it personal</h2><span className="font-display text-xl italic text-gold">03 / 03</span></div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Give someone their very own invitation. Change the name to make another link.</p>
            <label className="mt-4 block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">Guest name</span><input className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none transition focus:border-gold focus:ring-1 focus:ring-gold" value={details.guest} placeholder="e.g. Priya & family" onChange={e => update("guest", e.target.value)} /></label>
            <div className="mt-6 grid grid-cols-2 gap-2"><Button variant="elegant" className="h-11" onClick={() => setShareOpen(true)}><Send /> Share invite</Button><Button variant="delicate" className="h-11" onClick={() => { setGuestMode(true); setOpened(false); }}><Sparkles /> Guest view</Button></div>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">Your edits stay on this page until you share a link.</p>
          </div>
        </aside>
        <div className="relative min-w-0 bg-secondary/40 px-4 py-8 md:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-[620px]"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">A glimpse of your day</p><h2 className="mt-1 font-display text-3xl text-ink">Your invitation</h2></div><span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><span className="size-1.5 rounded-full bg-gold" /> Live preview</span></div><Invitation details={details} daysLeft={daysLeft} onSaveDate={saveDate} /></div>
        </div>
      </div>
      {shareOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShareOpen(false); }}><div className="glass-panel w-full max-w-md p-6 shadow-2xl md:p-8" role="dialog" aria-modal="true" aria-labelledby="share-title"><div className="flex items-start justify-between"><div className="text-gold"><Heart className="size-6" strokeWidth={1.3} /></div><Button variant="ghost" size="icon" aria-label="Close" onClick={() => setShareOpen(false)}><X /></Button></div><h2 id="share-title" className="mt-5 font-display text-4xl text-ink">Share the <em className="text-primary">joy.</em></h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">A personal invitation for {details.guest.trim() || "your loved ones"}. Send this link and let the celebration begin.</p><label className="mt-6 block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">Guest name</span><input className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-gold" value={details.guest} placeholder="Who is this for?" onChange={e => update("guest", e.target.value)} /></label><div className="mt-3 flex items-center gap-2 border border-border bg-background p-2"><Link2 className="ml-1 size-4 shrink-0 text-gold" /><span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{typeof window !== "undefined" ? makeLink(details, details.guest) : "Your invitation link"}</span><Button variant="outline" size="icon" className="shrink-0" onClick={copyLink} aria-label="Copy invitation link" title="Copy invitation link">{copied ? <Check /> : <Copy />}</Button></div><div className="mt-5 grid grid-cols-2 gap-2"><Button variant="elegant" className="h-11" onClick={whatsapp}><Send /> WhatsApp</Button><Button variant="delicate" className="h-11" onClick={copyLink}>{copied ? <Check /> : <Copy />} {copied ? "Copied!" : "Copy link"}</Button></div>{uploadedMusic && !details.music && <p className="mt-4 text-xs text-primary">Your uploaded song is not included in this link. Add a direct MP3 URL for guests to hear it.</p>}</div></div>}
    </>}
  </main>;
}

function Invitation({ details, daysLeft, guestMode = false, onSaveDate }: { details: Details; daysLeft: number | null; guestMode?: boolean; onSaveDate: () => void }) {
  return <article className={`overflow-hidden bg-ivory ${guestMode ? "" : "border border-gold/20 invitation-stage"}`}>
    <div className={`reveal-section parallax-hero relative isolate flex flex-col items-center justify-center overflow-hidden px-5 text-center ${guestMode ? "min-h-[min(960px,100svh)] py-24" : "min-h-[750px] py-20"}`}>
      <img src={ceremony} alt="Illustrated Hindu wedding ceremony arch with flowers, lamps and sacred fire" width={1024} height={1536} className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="ceremony-veil absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} className={`float-petal petal-${i + 1} absolute top-0 text-rose`}>✿</span>)}</div>
      <div className="ritual-flame pointer-events-none absolute bottom-[12%] left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-gold/20 blur-xl" aria-hidden="true" />
      <div className="relative mt-14 w-full max-w-xl sm:mt-16">
        <p className="reveal-up font-display text-xl text-primary sm:text-2xl">॥ श्री गणेशाय नमः ॥</p>
        <p className="reveal-up reveal-delay mt-8 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">Together with their families</p>
        <p className="reveal-up reveal-delay mt-5 font-display text-2xl italic text-primary sm:text-3xl">Joyfully invite you to celebrate</p>
        <h2 className="reveal-up reveal-late ambient-glow mx-auto mt-5 max-w-[85%] font-display text-[clamp(3.4rem,8vw,6rem)] leading-[.92] text-primary break-words"><span className="block warm-shimmer">{details.partner1Title && <span className="mr-2 align-middle text-[.28em] italic text-gold">{details.partner1Title}</span>}{details.partner1 || "Name"}</span><span className="my-2 block text-[.58em] italic leading-none text-gold">&</span><span className="block warm-shimmer">{details.partner2Title && <span className="mr-2 align-middle text-[.28em] italic text-gold">{details.partner2Title}</span>}{details.partner2 || "Name"}</span></h2>
        <div className="mx-auto mt-7 h-px w-24 bg-gold" />
        <p className="mt-6 font-display text-xl font-semibold text-primary sm:text-2xl">{weekday(details.date)} · {displayDate(details.date)}</p>
        <p className="mt-2 font-display text-lg italic text-ink">{displayTime(details.time)} · {details.venue || "Your venue"}</p>
      </div>
      {guestMode && <a href="#rituals" className="absolute bottom-6 flex flex-col items-center gap-1 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Scroll to celebrate <ArrowDown className="size-4 animate-bounce" /></a>}
    </div>
    <section id="rituals" className="reveal-section relative overflow-hidden border-y border-gold/20 bg-secondary px-6 py-14 text-center paper-texture sm:py-20">
      <p className="font-display text-xl text-gold">॥ शुभमंगल ॥</p>
      <h3 className="mt-2 font-display text-4xl text-primary sm:text-5xl">The sacred beginning</h3>
      <div className="mx-auto mt-8 max-w-[720px] overflow-hidden border-[6px] border-ivory shadow-lg sm:border-[10px]"><img src={rituals} alt="Illustration of bride and groom taking sacred wedding vows around the ceremonial fire" loading="lazy" width={1536} height={1024} className="ritual-scene w-full object-cover" /></div>
      <div className="mx-auto mt-7 flex max-w-md items-center justify-center gap-4 text-gold"><span className="h-px flex-1 bg-gold/50" /><span className="font-display text-2xl">✦</span><span className="h-px flex-1 bg-gold/50" /></div>
      <p className="mt-4 font-display text-2xl italic text-primary">Agni witnesses a promise of forever</p>
    </section>
    <section className="reveal-section px-6 py-12 text-center paper-texture sm:py-16"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">A note from the heart</p><p className="mx-auto mt-5 max-w-lg font-display text-2xl leading-relaxed text-primary sm:text-3xl">{details.message}</p></section>
    <section id="details" className="reveal-section paper-texture px-6 py-12 text-center sm:px-12 sm:py-16">
      <div className="mx-auto flex items-center justify-center gap-3 text-gold gold-divider"><span className="text-xl">✦</span></div>
      <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">You are warmly invited</p>
      <h3 className="mt-2 font-display text-4xl text-primary sm:text-5xl">A day to remember</h3>
      <p className="mx-auto mt-5 max-w-md font-display text-xl italic leading-relaxed text-foreground">{details.guest ? `Dear ${details.guest}, your presence would make our celebration complete.` : "Your presence would make our celebration complete."}</p>
      <div className="mx-auto my-9 h-px max-w-xs fine-rule" />
      <div className="grid gap-7 sm:grid-cols-3 sm:gap-4"><div><CalendarDays className="mx-auto size-5 text-gold" strokeWidth={1.4} /><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">The date</p><p className="mt-2 font-display text-xl text-ink">{displayDate(details.date)}</p></div><div><Sparkles className="mx-auto size-5 text-gold" strokeWidth={1.4} /><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">The time</p><p className="mt-2 font-display text-xl text-ink">{displayTime(details.time)}</p></div><div><MapPin className="mx-auto size-5 text-gold" strokeWidth={1.4} /><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">The place</p><p className="mt-2 font-display text-xl text-ink">{details.venue}<br/><span className="text-base">{details.city}</span></p></div></div>
      <div className="mx-auto mt-10 max-w-md">
        <div className="glass-panel location-card p-2">
          <iframe title={`Map of ${details.venue}, ${details.city}`} src={venueMap} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-56 w-full border-0 sm:h-64" />
        </div>
        <p className="mt-3 font-display text-lg italic text-primary">
          {mapLink(venuePlace, "underline decoration-gold/50 underline-offset-4", details.venue)}
          <span className="text-gold"> · </span>{details.city}
        </p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button variant="elegant" className="soft-action" onClick={onSaveDate}><CalendarDays /> Save the date</Button>
        <Button variant="delicate" className="soft-action" asChild>{mapLink(venuePlace, "inline-flex items-center gap-2", <><MapPin /> View location</>)}</Button>
        <Button variant="delicate" className="soft-action" asChild>{mapLink(venueDirections, "inline-flex items-center gap-2", <><Navigation className="size-4" /> Get directions</>)}</Button>
      </div>
    </section>
    <section className="reveal-section ambient-glow bg-primary px-6 py-12 text-center text-primary-foreground sm:py-14"><span className="font-display text-3xl italic text-gold-soft">Until forever begins</span><div className="mx-auto mt-5 flex items-baseline justify-center gap-2"><span className="countdown-box font-display text-6xl font-medium sm:text-7xl">{daysLeft === null ? "—" : daysLeft}</span><span className="text-xs uppercase tracking-[0.2em]">days to go</span></div><p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-soft">{coupleNames(details)} · {displayDate(details.date)}</p></section>
    <footer className="reveal-section bg-ivory px-6 py-9 text-center"><Heart className="mx-auto size-5 text-gold" strokeWidth={1.3} /><p className="mt-3 font-display text-2xl italic text-primary">We can't wait to celebrate with you.</p><p className="mt-4 font-display text-lg text-gold">॥ शुभमंगल ॥</p></footer>
  </article>;
}