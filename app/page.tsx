"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type Trek = {
  name: string;
  date: string;
  location: string;
  price: string;
  status: string;
  image: string;
};

/** Safety net: if somehow a raw Drive link slipped in, convert it */
function toDirectUrl(url: string): string {
  if (!url) return url;
  if (url.includes("lh3.googleusercontent.com")) return url;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  return url;
}

export default function Home() {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreks = async () => {
      const snapshot = await getDocs(collection(db, "treks"));
      const data: Trek[] = snapshot.docs.map((doc) => doc.data() as Trek);
      setTreks(data);
      setLoading(false);
    };
    fetchTreks();
  }, []);

  const upcoming = treks.filter((t) => t.status === "upcoming");
  const completed = treks.filter((t) => t.status === "completed");

  return (
    <div className="min-h-screen bg-[#080c10] text-white font-sans">

      {/* ── Fixed ambient blobs ─────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle,#16a34a,transparent 70%)" }} />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle,#0891b2,transparent 70%)" }} />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent 70%)" }} />
      </div>

      {/* ── Hero ────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-5 pt-20 pb-16 text-center">

          {/* pill badge */}
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-xs font-medium px-4 py-1.5 rounded-full mb-7 backdrop-blur-sm tracking-wider uppercase">
            <span className="text-base">🏔️</span>
            Trekking Adventures
          </span>

          <h1 className="text-5xl sm:text-6xl font-black leading-[1.1] tracking-tight">
            Dullakad&nbsp;
            <span className="relative inline-block">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg,#4ade80 0%,#22d3ee 50%,#818cf8 100%)" }}
              >
                Treks
              </span>
              {/* underline glow */}
              <span
                className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg,#4ade80,#22d3ee,#818cf8)" }}
              />
            </span>
          </h1>

          <p className="mt-5 text-white/50 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Discover breathtaking trails, curated adventures &amp;&nbsp;unforgettable memories in&nbsp;the mountains.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
            <a
              href="#upcoming"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-white shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#16a34a,#0891b2)" }}
            >
              Explore Upcoming Treks ↓
            </a>
            {completed.length > 0 && (
              <a
                href="#completed"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-white/60 border border-white/15 hover:bg-white/5 transition-all duration-200"
              >
                Past Treks
              </a>
            )}
          </div>

          {/* stats row */}
          {!loading && (
            <div className="mt-12 flex justify-center gap-8 sm:gap-14 text-center">
              {[
                { value: upcoming.length, label: "Upcoming" },
                { value: completed.length, label: "Completed" },
                { value: treks.length, label: "Total Treks" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-black bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg,#4ade80,#22d3ee)" }}>
                    {value}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5 tracking-wide uppercase">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-20">

        {/* ── Upcoming Treks ─────────────────────────────── */}
        <section id="upcoming" className="scroll-mt-10">
          <div className="flex items-center gap-3 mb-6 mt-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_10px_3px_#4ade80]" />
            <h2 className="text-2xl font-extrabold tracking-wide">Upcoming Treks</h2>
          </div>

          {/* skeleton */}
          {loading && (
            <div className="grid sm:grid-cols-2 gap-5">
              {[1, 2].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && upcoming.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <p className="text-4xl mb-3">🏞️</p>
              <p>No upcoming treks scheduled right now.</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            {upcoming.map((t, i) => (
              <article
                key={i}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-green-400/30"
              >
                {/* Image */}
                {t.image ? (
                  <div className="relative h-52 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={toDirectUrl(t.image)}
                      alt={t.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    {/* gradient overlay */}
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(8,12,16,0.95) 0%, rgba(8,12,16,0.3) 50%, transparent 100%)" }} />
                    {/* price badge */}
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      ₹{t.price}
                    </span>
                    {/* status badge */}
                    <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-2.5 py-1 rounded-full border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_1px_#4ade80]" />
                      Upcoming
                    </span>
                  </div>
                ) : (
                  <div className="h-24 bg-gradient-to-r from-green-900/40 to-cyan-900/40 flex items-center justify-center text-3xl">
                    🏔️
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold leading-tight">{t.name}</h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-sm text-white/50">
                    <span className="flex items-center gap-1.5">
                      <span>📅</span>
                      {t.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>📍</span>
                      {t.location}
                    </span>
                  </div>

                  {!t.image && (
                    <p className="mt-2 text-green-400 font-bold">₹{t.price}</p>
                  )}

                  <a
                    href={`https://wa.me/91XXXXXXXXXX?text=Hi I want to join ${encodeURIComponent(t.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:brightness-110 active:scale-95"
                    style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M16 2C8.27 2 2 8.27 2 16c0 2.44.66 4.82 1.9 6.9L2 30l7.35-1.87A13.9 13.9 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.2a11.17 11.17 0 01-5.7-1.56l-.41-.24-4.36 1.11 1.14-4.25-.27-.44A11.2 11.2 0 1116 27.2zm6.14-8.35c-.34-.17-2-.98-2.3-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.32-.2.22-.39.25-.73.08-.34-.17-1.44-.53-2.74-1.69a10.3 10.3 0 01-1.9-2.36c-.2-.34-.02-.52.15-.69l.5-.57c.16-.19.21-.34.32-.56.1-.22.05-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.57-.58-.77-.59H9.7c-.22 0-.59.08-.9.42C8.48 10.64 7.6 11.5 7.6 13.2s1.16 3.36 1.32 3.6c.17.22 2.28 3.49 5.53 4.9.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.64-.38z" />
                    </svg>
                    Book via WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Previous Treks ─────────────────────────────── */}
        {completed.length > 0 && (
          <section id="completed" className="mt-16 scroll-mt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
              <h2 className="text-2xl font-extrabold tracking-wide text-white/60">Previous Treks</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {completed.map((t, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl overflow-hidden border border-white/8 bg-white/4 hover:bg-white/8 transition-all duration-200 group"
                >
                  {t.image && (
                    <div className="h-32 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={toDirectUrl(t.image)}
                        alt={t.name}
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white/70 text-sm">{t.name}</h3>
                      <p className="text-xs text-white/35 mt-0.5">{t.date} · {t.location}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium bg-white/8 text-white/40 px-3 py-1 rounded-full border border-white/10">
                      Done ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 text-center text-white/25 text-xs tracking-wide">
        © {new Date().getFullYear()} Dullakad Treks · All rights reserved
      </footer>
    </div>
  );
}