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
    <div className="min-h-screen bg-[#0d1117] text-white font-sans">
      {/* ── Hero ──────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        {/* animated gradient blob */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #16a34a, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #0891b2, transparent 70%)" }}
          />
        </div>

        <div className="max-w-2xl mx-auto px-5 pt-16 pb-12 text-center">
          {/* logo pill */}
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-sm px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <span className="text-base">🏔️</span>
            Treking Adventures
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Dullakad&nbsp;
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg,#4ade80,#22d3ee)" }}
            >
              Treks
            </span>
          </h1>

          <p className="mt-4 text-white/60 text-base sm:text-lg max-w-sm mx-auto">
            Discover breathtaking trails, curated adventures &amp;&nbsp;unforgettable memories in&nbsp;the mountains.
          </p>

          <a
            href="#upcoming"
            className="mt-8 inline-block px-8 py-3 rounded-full font-semibold text-sm text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg,#16a34a,#0891b2)" }}
          >
            Explore Treks ↓
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16">
        {/* ── Upcoming Treks ────────────────────────────── */}
        <section id="upcoming">
          <div className="flex items-center gap-3 mb-5 mt-2">
            <span className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_2px_#4ade80]" />
            <h2 className="text-xl font-bold tracking-wide">Upcoming Treks</h2>
          </div>

          {loading && (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && upcoming.length === 0 && (
            <p className="text-white/40 text-center py-10">No upcoming treks scheduled right now.</p>
          )}

          <div className="space-y-5">
            {upcoming.map((t, i) => (
              <article
                key={i}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Image */}
                {t.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* gradient overlay */}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,17,23,0.85) 0%, transparent 60%)" }} />
                    {/* price badge */}
                    <span className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      ₹{t.price}
                    </span>
                  </div>
                ) : (
                  <div className="h-20 bg-gradient-to-r from-green-900/40 to-cyan-900/40" />
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold">{t.name}</h3>

                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <span>📅</span> {t.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📍</span> {t.location}
                    </span>
                  </div>

                  {!t.image && (
                    <p className="mt-1 text-green-400 font-semibold">₹{t.price}</p>
                  )}

                  <a
                    href={`https://wa.me/91XXXXXXXXXX?text=Hi I want to join ${encodeURIComponent(t.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M16 2C8.27 2 2 8.27 2 16c0 2.44.66 4.82 1.9 6.9L2 30l7.35-1.87A13.9 13.9 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.2a11.17 11.17 0 01-5.7-1.56l-.41-.24-4.36 1.11 1.14-4.25-.27-.44A11.2 11.2 0 1116 27.2zm6.14-8.35c-.34-.17-2-.98-2.3-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.32-.2.22-.39.25-.73.08-.34-.17-1.44-.53-2.74-1.69a10.3 10.3 0 01-1.9-2.36c-.2-.34-.02-.52.15-.69l.5-.57c.16-.19.21-.34.32-.56.1-.22.05-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.57-.58-.77-.59H9.7c-.22 0-.59.08-.9.42C8.48 10.64 7.6 11.5 7.6 13.2s1.16 3.36 1.32 3.6c.17.22 2.28 3.49 5.53 4.9.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.64-.38z" />
                    </svg>
                    Book via WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Previous Treks ────────────────────────────── */}
        {completed.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-3 h-3 rounded-full bg-white/30" />
              <h2 className="text-xl font-bold tracking-wide text-white/70">Previous Treks</h2>
            </div>

            <div className="space-y-3">
              {completed.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-white/80">{t.name}</h3>
                    <p className="text-sm text-white/40 mt-0.5">
                      {t.date} &bull; {t.location}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium bg-white/10 text-white/50 px-3 py-1 rounded-full">
                    Done
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="text-center text-white/30 text-xs pb-8">
        © {new Date().getFullYear()} Dullakad Treks · All rights reserved
      </footer>
    </div>
  );
}