"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

type TrekData = {
  id?: string;
  name: string;
  date: string;
};

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  trek: TrekData | null;
};

export default function BookingModal({ isOpen, onClose, trek }: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !trek) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Indian phone number validation: 10 digits starting with 6, 7, 8, or 9
    const cleanedPhone = phone.replace(/\s+/g, "");
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!name.trim()) {
      alert("Please provide your name.");
      return;
    }

    if (!phoneRegex.test(cleanedPhone)) {
      alert("Please enter a valid 10-digit Indian phone number.");
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, "bookings"), {
        userName: name,
        userPhone: phone,
        trekId: trek.id || "unknown",
        trekName: trek.name,
        trekDate: trek.date,
        createdAt: new Date().toISOString()
      });
      
      const msg = `Hi I want to join the ${trek.name} trek on ${trek.date}!\nName: ${name}\nPhone: ${phone}`;
      window.open(`https://wa.me/919928900857?text=${encodeURIComponent(msg)}`, "_blank");
      
      onClose();
      // Reset form
      setName("");
      setPhone("");
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to save your inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => !loading && onClose()}
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-[#0d1117]/90 border border-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-xl border-t-emerald-500/30">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
        >
          ✕
        </button>
        
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Booking Inquiry
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">Join the Adventure</h2>
          <p className="text-white/60 text-sm">You are inquiring for <strong className="text-white">{trek.name}</strong> on {trek.date}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Your Name <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">WhatsApp Number <span className="text-red-400">*</span></label>
            <input 
              type="tel" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2 relative overflow-hidden group"
            style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            {loading ? "Processing..." : (
              <>
                <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 2C8.27 2 2 8.27 2 16c0 2.44.66 4.82 1.9 6.9L2 30l7.35-1.87A13.9 13.9 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.2a11.17 11.17 0 01-5.7-1.56l-.41-.24-4.36 1.11 1.14-4.25-.27-.44A11.2 11.2 0 1116 27.2zm6.14-8.35c-.34-.17-2-.98-2.3-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.32-.2.22-.39.25-.73.08-.34-.17-1.44-.53-2.74-1.69a10.3 10.3 0 01-1.9-2.36c-.2-.34-.02-.52.15-.69l.5-.57c.16-.19.21-.34.32-.56.1-.22.05-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.57-.58-.77-.59H9.7c-.22 0-.59.08-.9.42C8.48 10.64 7.6 11.5 7.6 13.2s1.16 3.36 1.32 3.6c.17.22 2.28 3.49 5.53 4.9.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.64-.38z" />
                </svg>
                Continue to WhatsApp
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-white/30 hidden sm:block">
            Your details will be safely sent to the Dulakkad Treks admin team.
          </p>
        </form>
      </div>
    </div>
  );
}
