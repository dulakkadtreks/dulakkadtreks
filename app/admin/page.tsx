"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

/** Convert any Google Drive share link to a direct-embeddable URL */
function toDriveImageUrl(url: string): string {
  if (!url) return url;
  // already a direct lh3 link
  if (url.includes("lh3.googleusercontent.com")) return url;
  // match /file/d/<id>/ or id= param
  const m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  return url;
}

export default function Admin() {
  const [trek, setTrek] = useState({
    name: "",
    date: "",
    location: "",
    price: "",
    status: "upcoming",
    image: "",
  });
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  // 🔐 Protect admin
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) window.location.href = "/login";
    });
  }, []);

  const handleImageChange = (raw: string) => {
    setTrek({ ...trek, image: raw });
    setPreview(toDriveImageUrl(raw));
  };

  const saveTrek = async () => {
    setSaving(true);
    await addDoc(collection(db, "treks"), {
      ...trek,
      image: toDriveImageUrl(trek.image),
    });
    setSaving(false);
    alert("Trek Added ✅");
    setTrek({ name: "", date: "", location: "", price: "", status: "upcoming", image: "" });
    setPreview("");
  };

  // 🚪 Logout
  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const field =
    "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition mb-3";

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center px-4 py-10">
      {/* background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle,#16a34a,transparent 70%)" }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#0891b2,transparent 70%)" }} />
      </div>

      <div className="w-full max-w-md">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="flex items-center gap-2 text-xs text-white/40 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_#4ade80]" />
              Admin Panel
            </span>
            <h1 className="text-2xl font-extrabold">Add a Trek</h1>
          </div>
          <button
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/10 transition"
          >
            Logout
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-1">
          <input className={field} placeholder="Trek Name"
            value={trek.name} onChange={(e) => setTrek({ ...trek, name: e.target.value })} />

          <input type="date" className={field}
            value={trek.date} onChange={(e) => setTrek({ ...trek, date: e.target.value })} />

          <input className={field} placeholder="Location"
            value={trek.location} onChange={(e) => setTrek({ ...trek, location: e.target.value })} />

          <input className={field} placeholder="Price (₹)"
            value={trek.price} onChange={(e) => setTrek({ ...trek, price: e.target.value })} />

          <select className={field} value={trek.status}
            onChange={(e) => setTrek({ ...trek, status: e.target.value })}>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>

          {/* Google Drive image input */}
          <div>
            <input className={field}
              placeholder="Google Drive image link (share link)"
              value={trek.image}
              onChange={(e) => handleImageChange(e.target.value)}
            />
            <p className="text-xs text-white/30 -mt-2 mb-3 px-1">
              Paste the &quot;Anyone with link&quot; share URL from Google Drive
            </p>

            {preview && (
              <div className="relative mb-3 rounded-xl overflow-hidden border border-white/10 h-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition">
                  <span className="text-xs text-white/70">Preview</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={saveTrek}
            disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#16a34a,#0891b2)" }}
          >
            {saving ? "Saving…" : "Save Trek ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}