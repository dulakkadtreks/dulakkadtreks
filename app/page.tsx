"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import BookingModal from "@/components/BookingModal";

type Trek = {
  id?: string;
  name: string;
  date: string;
  location: string;
  price: string;
  status: string;
  image?: string;
  images?: string[];
  description?: string;
};

/** Safety net: convert raw Drive share links to embeddable URLs */
function toDirectUrl(url: string): string {
  if (!url) return url;
  if (url.includes("lh3.googleusercontent.com")) return url;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  return url;
}

/** Get all images for a trek */
function getTrekImages(t: Trek): string[] {
  if (t.images && t.images.length > 0) return t.images.map(toDirectUrl);
  if (t.image) return [toDirectUrl(t.image)];
  return ["/images/bg1.png"]; // Default mountain image fallback
}

/* ── Image Carousel component ─────────────────────── */
function TrekImageCarousel({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div className="relative h-60 sm:h-64 overflow-hidden group/carousel">
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[current]}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-1000 group-hover/carousel:scale-110"
        referrerPolicy="no-referrer"
      />

      {/* dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-transparent to-transparent opacity-90 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Prev / Next arrows — only when multiple images */}
      {images.length > 1 && (
        <>
          <div
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110 shadow-lg cursor-pointer"
            aria-label="Previous image"
          >
            ←
          </div>
          <div
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110 shadow-lg cursor-pointer"
            aria-label="Next image"
          >
            →
          </div>

          {/* dot indicators */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === current ? "bg-white w-6" : "bg-white/30 w-1.5 hover:bg-white/60"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* count badge */}
          <span className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-xl z-10">
            {current + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}

/* ── Main page ────────────────────────────────────── */
export default function Home() {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingTrek, setBookingTrek] = useState<Trek | null>(null);

  useEffect(() => {
    const fetchTreks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "treks"));
        const data: Trek[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Trek));
        setTreks(data);
      } catch (error) {
        console.error("Error fetching treks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTreks();
  }, []);

  const upcoming = treks.filter((t) => t.status === "upcoming");
  const completed = treks.filter((t) => t.status === "completed");

  return (
    <div className="min-h-screen bg-[#06090f] text-slate-100 font-sans selection:bg-emerald-500/30">

      {/* ── Ambient Background Glows ─────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity" style={{ backgroundImage: "url('/images/bg1.png')" }}></div>
        {/* Top left emerald glow */}
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/10 blur-[120px]" />
        {/* Center right cyan glow */}
        <div className="absolute top-[30%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-cyan-600/10 blur-[140px]" />
        {/* Bottom left violet glow */}
        <div className="absolute -bottom-[20%] -left-[20%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[120px]" />
        {/* Star dust overlay effect */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* ── Hero ────────────────────────────────────── */}
      <header className="relative w-full overflow-hidden flex flex-col items-center justify-center pt-28 pb-20 px-4 min-h-[70vh]">
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

        {/* ── Social Media Nav ──────────────────────── */}
        <div className="absolute top-6 left-0 w-full flex justify-center gap-4 z-50">
          <a href="https://www.instagram.com/dulak_kad/" target="_blank" rel="noopener noreferrer" 
             className="w-11 h-11 rounded-full bg-[#0d1117]/80 border border-white/10 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400 transition-all hover:scale-110 shadow-lg backdrop-blur-md text-white/70" aria-label="Instagram">
            <svg className="w-5 h-5 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://www.facebook.com/share/17ayJDcjTQ/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" 
             className="w-11 h-11 rounded-full bg-[#0d1117]/80 border border-white/10 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400 transition-all hover:scale-110 shadow-lg backdrop-blur-md text-white/70" aria-label="Facebook">
            <svg className="w-5 h-5 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
           </a>
          <a href="https://chat.whatsapp.com/IpVXySLpKgjCPaXrwargwX?mode=gi_t" target="_blank" rel="noopener noreferrer" 
             className="w-11 h-11 rounded-full bg-[#0d1117]/80 border border-white/10 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400 transition-all hover:scale-110 shadow-lg backdrop-blur-md text-white/70" aria-label="WhatsApp Group">
            <svg className="w-5 h-5 drop-shadow-md" viewBox="0 0 32 32" fill="currentColor"><path d="M16 2C8.27 2 2 8.27 2 16c0 2.44.66 4.82 1.9 6.9L2 30l7.35-1.87A13.9 13.9 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.2a11.17 11.17 0 01-5.7-1.56l-.41-.24-4.36 1.11 1.14-4.25-.27-.44A11.2 11.2 0 1116 27.2zm6.14-8.35c-.34-.17-2-.98-2.3-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.32-.2.22-.39.25-.73.08-.34-.17-1.44-.53-2.74-1.69a10.3 10.3 0 01-1.9-2.36c-.2-.34-.02-.52.15-.69l.5-.57c.16-.19.21-.34.32-.56.1-.22.05-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.57-.58-.77-.59H9.7c-.22 0-.59.08-.9.42C8.48 10.64 7.6 11.5 7.6 13.2s1.16 3.36 1.32 3.6c.17.22 2.28 3.49 5.53 4.9.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.64-.38z" /></svg>
          </a>
        </div>
        
        <div className="max-w-4xl mx-auto text-center z-10 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <span className="animate-pulse">✨</span>
            Curated Wilderness Experiences
          </span>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[1.05] tracking-tighter text-white drop-shadow-2xl">
            Dulakkad<br className="sm:hidden" />
            <span className="relative inline-block ml-0 sm:ml-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Treks
              </span>
              <span className="absolute -bottom-2 sm:-bottom-4 left-0 w-full h-1 sm:h-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 blur-[2px] opacity-70" />
            </span>
          </h1>

          <p className="mt-8 text-slate-300/80 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-light">
            Escape the ordinary. Discover breathtaking trails, curated adventures, &amp; unforgettable memories in the mountains.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 items-center">
            <a href="#upcoming"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 group-hover:from-emerald-300 group-hover:to-teal-500 transition-colors"></span>
              <span className="relative flex items-center gap-2">Explore Upcoming Treks <span className="group-hover:translate-y-1 transition-transform">↓</span></span>
            </a>
            {completed.length > 0 && (
              <a href="#completed"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base text-slate-300 border border-slate-700/50 bg-slate-800/20 backdrop-blur-sm hover:bg-slate-700/40 hover:text-white transition-all duration-300 hover:shadow-lg">
                View Past Treks
              </a>
            )}
          </div>

          {/* stats row */}
          {!loading && (
            <div className="mt-16 flex justify-center gap-8 sm:gap-16 text-center animate-fade-in delay-200">
              {[
                { value: upcoming.length, label: "Upcoming" },
                { value: completed.length, label: "Completed" },
                { value: treks.length, label: "Total Treks" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center">
                  <p className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                    {value}
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-400/80 mt-1 font-semibold tracking-widest uppercase">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 z-10 relative">

        {/* ── Upcoming Treks ───────────────────────────── */}
        <section id="upcoming" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Featured Upcoming Treks</h2>
          </div>

          {loading && (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2].map((n) => (
                <div key={n} className="h-96 rounded-3xl bg-slate-800/30 animate-pulse border border-slate-700/50" />
              ))}
            </div>
          )}

          {!loading && upcoming.length === 0 && (
            <div className="text-center py-20 px-6 rounded-3xl bg-slate-800/20 border border-slate-700/30 backdrop-blur-xl">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                🏞️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No upcomings scheduled!</h3>
              <p className="text-slate-400">We're planning new adventures. Check back soon for more thrilling treks.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {upcoming.map((t, i) => {
              const imgs = getTrekImages(t);
              return (
                <div key={t.id || i}
                  className="group flex flex-col relative rounded-[2rem] overflow-hidden bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)] hover:border-emerald-500/50 hover:bg-slate-800/60 z-10 flex-1">
                  
                  <Link href={`/trek/${t.id}`} className="relative block flex-grow">
                    <div className="relative">
                      {imgs.length > 0 ? (
                        <TrekImageCarousel images={imgs} name={t.name} />
                      ) : (
                        <div className="h-60 sm:h-64 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 flex items-center justify-center">
                          <span className="text-5xl drop-shadow-lg opacity-80">🏔️</span>
                        </div>
                      )}
                      
                      {/* Status badge */}
                      <span className="absolute top-4 left-4 flex items-center gap-2 bg-[#06090f]/80 backdrop-blur-md text-emerald-300 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-lg z-10">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                        Upcoming
                      </span>
                    </div>

                    <div className="p-6 sm:p-8 flex flex-col">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h3 className="text-2xl font-bold leading-tight text-white group-hover:text-emerald-300 transition-colors line-clamp-2">{t.name}</h3>
                        <div className="shrink-0 bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1.5 rounded-xl border border-emerald-500/20">
                          ₹{t.price}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 text-sm text-slate-300">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">📅</div>
                          <span className="font-medium text-slate-200">{t.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">📍</div>
                          <span className="font-medium text-slate-200 line-clamp-1">{t.location}</span>
                        </div>
                        {t.description && (
                          <div className="mt-2 text-slate-400 line-clamp-2 text-sm">
                            {t.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 mt-auto">
                    <div className="pt-6 border-t border-slate-700/50">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBookingTrek(t); }}
                        className="relative overflow-hidden group/btn flex items-center justify-center gap-2.5 w-full py-4 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] bg-[#25D366]">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                        <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 32 32" fill="currentColor">
                          <path d="M16 2C8.27 2 2 8.27 2 16c0 2.44.66 4.82 1.9 6.9L2 30l7.35-1.87A13.9 13.9 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.2a11.17 11.17 0 01-5.7-1.56l-.41-.24-4.36 1.11 1.14-4.25-.27-.44A11.2 11.2 0 1116 27.2zm6.14-8.35c-.34-.17-2-.98-2.3-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.32-.2.22-.39.25-.73.08-.34-.17-1.44-.53-2.74-1.69a10.3 10.3 0 01-1.9-2.36c-.2-.34-.02-.52.15-.69l.5-.57c.16-.19.21-.34.32-.56.1-.22.05-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.57-.58-.77-.59H9.7c-.22 0-.59.08-.9.42C8.48 10.64 7.6 11.5 7.6 13.2s1.16 3.36 1.32 3.6c.17.22 2.28 3.49 5.53 4.9.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.64-.38z" />
                        </svg>
                        Book via WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Previous Treks ───────────────────────────── */}
        {completed.length > 0 && (
          <section id="completed" className="mt-24 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <span className="text-xl">📸</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-200">Wall of Memories</h2>
              </div>
              <p className="text-slate-400 text-sm font-medium">Past Expeditions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map((t, i) => {
                const imgs = getTrekImages(t);
                return (
                  <Link href={`/trek/${t.id}`} key={t.id || i}
                    className="group relative flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-600">
                    {imgs.length > 0 ? (
                      <div className="h-40 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgs[0]} alt={t.name}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                          referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                      </div>
                    ) : (
                      <div className="h-40 bg-slate-800/50 flex items-center justify-center opacity-50 relative">
                        <span className="text-4xl filter grayscale">🏔️</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                      </div>
                    )}
                    <div className="p-5 flex-grow flex flex-col justify-center relative z-10 -mt-8 bg-gradient-to-b from-transparent to-slate-900 via-slate-900/90">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-white text-lg line-clamp-1 pr-2 group-hover:text-emerald-300 transition-colors">{t.name}</h3>
                        <span className="shrink-0 bg-slate-800/80 backdrop-blur-sm text-slate-400 text-[10px] uppercase font-bold px-2 py-1 rounded-md border border-slate-700/50 shadow-sm mt-1">
                          Completed
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 font-medium">
                        {t.date} <span className="mx-1 text-slate-600">•</span> {t.location}
                      </p>
                      {imgs.length > 1 && (
                        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400/80">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {imgs.length} Photos Gallery
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="relative border-t border-slate-800/60 bg-slate-900/30 overflow-hidden">
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
               <span className="text-white font-bold text-sm">D</span>
             </div>
             <span className="font-bold text-slate-200 tracking-wide text-lg">Dulakkad Treks</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-slate-400 text-sm font-medium">
              © {new Date().getFullYear()} Dulakkad Treks. Curating adventures and redefining wilderness.
            </p>
          </div>
        </div>
      </footer>
      
      <BookingModal 
        isOpen={!!bookingTrek} 
        onClose={() => setBookingTrek(null)} 
        trek={bookingTrek ? { id: bookingTrek.id, name: bookingTrek.name, date: bookingTrek.date } : null} 
      />
    </div>
  );
}