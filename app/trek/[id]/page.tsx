"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type Trek = {
  id: string;
  name: string;
  date: string;
  location: string;
  leader?: string;
  price: string;
  status: string;
  image?: string;
  images?: string[];
  description?: string;
};

/** Convert any Google Drive share link to a direct-embeddable URL */
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
  return [];
}

export default function TrekPage() {
  const params = useParams();
  const router = useRouter();
  
  const [trek, setTrek] = useState<Trek | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrek = async () => {
      try {
        const id = params.id as string;
        const docRef = doc(db, "treks", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTrek({ id: docSnap.id, ...docSnap.data() } as Trek);
        }
      } catch (err) {
        console.error("Error fetching trek", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrek();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c10] flex items-center justify-center text-white/50">
        <p className="animate-pulse">Loading adventure...</p>
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="min-h-screen bg-[#080c10] flex flex-col items-center justify-center text-white">
        <p className="text-4xl mb-4">🏔️</p>
        <h1 className="text-2xl font-bold mb-2">Trek Not Found</h1>
        <button onClick={() => router.push("/")} className="text-green-400 hover:text-green-300">
          ← Back to safety
        </button>
      </div>
    );
  }

  const imgs = getTrekImages(trek);

  return (
    <div className="min-h-screen bg-[#080c10] text-white font-sans pb-20">

      {/* Floating Back Button */}
      <button 
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-xl hover:bg-white/10 transition-colors"
      >
        ←
      </button>

      {/* ── Hero section ───────────────────────────── */}
      <div className="relative h-[50vh] min-h-[400px] w-full border-b border-white/5">
        {imgs.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={imgs[0]} 
            alt={trek.name} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-green-900/40 to-cyan-900/40 flex items-center justify-center text-6xl">
            🏔️
          </div>
        )}
        
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, #080c10 0%, rgba(8,12,16,0.3) 100%)" }} />
          
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12 max-w-5xl mx-auto">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 backdrop-blur-sm border ${trek.status === 'upcoming' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/10 text-white/60 border-white/10'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${trek.status === 'upcoming' ? 'bg-green-400 shadow-[0_0_6px_1px_#4ade80]' : 'bg-white/40'}`} />
            {trek.status.toUpperCase()}
          </span>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight mb-2">
            {trek.name}
          </h1>
          <div className="flex flex-wrap gap-4 text-white/60 sm:text-lg mb-2">
            <span className="flex items-center gap-1.5"><span>📅</span>{trek.date}</span>
            <span className="flex items-center gap-1.5"><span>📍</span>{trek.location}</span>
          </div>
          {trek.leader && (
            <div className="flex items-center gap-2 text-white/80">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">👤</span>
              <span className="text-sm">Led by <strong className="text-white">{trek.leader}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 sm:px-12 mt-8 flex flex-col lg:flex-row gap-12">
        
        {/* Main Info & Gallery / Left */}
        <div className="flex-1">
          {trek.description && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>📝</span> About This Trek
              </h2>
              <div className="text-white/80 leading-relaxed space-y-4 text-lg">
                {trek.description.split('\n').map((paragraph, i) => (
                  paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                ))}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📸</span> Photo Gallery <span className="text-sm font-normal text-white/40">({imgs.length})</span>
          </h2>
          
          {imgs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-white/40">
              No photos have been uploaded for this trek yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imgs.map((src, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedImage(src)}
                  className={`relative rounded-xl overflow-hidden bg-white/5 cursor-pointer group ${i === 0 ? "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 aspect-square" : "aspect-square"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={src} 
                    alt={`${trek.name} ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Card / Right */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <p className="text-sm text-white/50 mb-1">Price per person</p>
            <p className="text-4xl font-black text-green-400 mb-6">₹{trek.price}</p>
            
            <a
              href={`https://wa.me/91XXXXXXXXXX?text=Hi I want to join the ${encodeURIComponent(trek.name)} trek on ${encodeURIComponent(trek.date)}!`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 2C8.27 2 2 8.27 2 16c0 2.44.66 4.82 1.9 6.9L2 30l7.35-1.87A13.9 13.9 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.2a11.17 11.17 0 01-5.7-1.56l-.41-.24-4.36 1.11 1.14-4.25-.27-.44A11.2 11.2 0 1116 27.2zm6.14-8.35c-.34-.17-2-.98-2.3-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.32-.2.22-.39.25-.73.08-.34-.17-1.44-.53-2.74-1.69a10.3 10.3 0 01-1.9-2.36c-.2-.34-.02-.52.15-.69l.5-.57c.16-.19.21-.34.32-.56.1-.22.05-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.57-.58-.77-.59H9.7c-.22 0-.59.08-.9.42C8.48 10.64 7.6 11.5 7.6 13.2s1.16 3.36 1.32 3.6c.17.22 2.28 3.49 5.53 4.9.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.64-.38z" />
              </svg>
              Book via WhatsApp
            </a>
            
            <p className="text-center text-xs text-white/30 mt-4 leading-relaxed">
              Clicking this will open WhatsApp directly to chat with our team.
            </p>
          </div>
        </div>
      </main>

      {/* ── Fullscreen Image Modal ─────────────────── */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={selectedImage} 
            alt="Fullscreen preview" 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

    </div>
  );
}
