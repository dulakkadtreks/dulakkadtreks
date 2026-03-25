"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

type Trek = {
  id?: string;
  name: string;
  date: string;
  location: string;
  leader?: string;
  price: string;
  status: string;
  image?: string;
  images?: string[];
};

/** Convert any Google Drive share link to a direct-embeddable URL */
function toDriveImageUrl(url: string): string {
  if (!url?.trim()) return "";
  if (url.includes("lh3.googleusercontent.com")) return url.trim();
  const m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  return url.trim();
}

/** Get all images for a trek */
function getTrekImages(t: Trek): string[] {
  if (t.images && t.images.length > 0) return t.images.map(toDriveImageUrl);
  if (t.image) return [toDriveImageUrl(t.image)];
  return [];
}

const emptyTrek = { name: "", date: "", location: "", leader: "", price: "", status: "upcoming" };

export default function Admin() {
  const [trek, setTrek] = useState<Trek>(emptyTrek);
  const [imageInputs, setImageInputs] = useState<string[]>([""]);

  const [treksList, setTreksList] = useState<Trek[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadingTreks, setLoadingTreks] = useState(true);

  // 🔐 Protect admin
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) window.location.href = "/login";
    });
  }, []);

  // Fetch treks
  const fetchTreks = async () => {
    setLoadingTreks(true);
    const snapshot = await getDocs(collection(db, "treks"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Trek));
    setTreksList(data);
    setLoadingTreks(false);
  };

  useEffect(() => {
    fetchTreks();
  }, []);

  // Image input handlers
  const updateImage = (index: number, value: string) => {
    const updated = [...imageInputs];
    updated[index] = value;
    setImageInputs(updated);
  };
  const addImageField = () => setImageInputs([...imageInputs, ""]);
  const removeImageField = (index: number) => {
    if (imageInputs.length === 1) return;
    setImageInputs(imageInputs.filter((_, i) => i !== index));
  };

  // 💾 Save or Update Trek
  const saveTrek = async () => {
    setSaving(true);
    const images = imageInputs.map(toDriveImageUrl).filter((u) => u.length > 0);

    const trekData = {
      ...trek,
      images,
      image: images[0] ?? "",
    };
    delete trekData.id;

    if (editingId) {
      // Update existing
      await updateDoc(doc(db, "treks", editingId), trekData);
      alert("Trek Updated ✅");
    } else {
      // Create new
      await addDoc(collection(db, "treks"), trekData);
      alert("Trek Added ✅");
    }

    setSaving(false);
    resetForm();
    fetchTreks(); // Refresh list
  };

  // ✏️ Edit Trek
  const handleEdit = (t: Trek) => {
    setEditingId(t.id!);
    setTrek({
      name: t.name,
      date: t.date,
      location: t.location,
      leader: t.leader || "",
      price: t.price,
      status: t.status,
    });
    
    // load images into inputs
    const imgs = getTrekImages(t);
    if (imgs.length > 0) {
      setImageInputs(imgs);
    } else {
      setImageInputs([""]);
    }
    
    // scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🗑️ Delete Trek
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    await deleteDoc(doc(db, "treks", id));
    setTreksList((prev) => prev.filter((t) => t.id !== id));
    
    if (editingId === id) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setTrek(emptyTrek);
    setImageInputs([""]);
  };

  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const field =
    "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition mb-3";

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-4 sm:p-8">
      {/* background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle,#16a34a,transparent 70%)" }} />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#0891b2,transparent 70%)" }} />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* ── Left Column: Form ──────────────────────── */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="flex items-center gap-2 text-xs text-white/40 mb-1">
                <span className={`w-2 h-2 rounded-full shadow-[0_0_6px_2px_currentColor] ${editingId ? "bg-amber-400 text-amber-400" : "bg-green-400 text-green-400"}`} />
                Admin Panel
              </span>
              <h1 className="text-2xl font-extrabold">{editingId ? "Edit Trek" : "Add New Trek"}</h1>
            </div>
            <button onClick={logout}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/10 transition lg:hidden">
              Logout
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-8">
            <input className={field} placeholder="Trek Name"
              value={trek.name} onChange={(e) => setTrek({ ...trek, name: e.target.value })} />
            <input type="date" className={field}
              value={trek.date} onChange={(e) => setTrek({ ...trek, date: e.target.value })} />
            <input className={field} placeholder="Location"
              value={trek.location} onChange={(e) => setTrek({ ...trek, location: e.target.value })} />
            <input className={field} placeholder="Trek Leader (optional)"
              value={trek.leader || ""} onChange={(e) => setTrek({ ...trek, leader: e.target.value })} />
            <input className={field} placeholder="Price (₹)"
              value={trek.price} onChange={(e) => setTrek({ ...trek, price: e.target.value })} />
            <select className={field} value={trek.status}
              onChange={(e) => setTrek({ ...trek, status: e.target.value })}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>

            <div className="mb-4">
              <p className="text-xs text-white/50 mb-2">🖼️ Google Drive Image Links</p>
              {imageInputs.map((url, i) => (
                <div key={i} className="mb-2">
                  <div className="flex gap-2 items-start">
                    <input
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition text-sm"
                      placeholder={`Image ${i + 1} link`}
                      value={url}
                      onChange={(e) => updateImage(i, e.target.value)}
                    />
                    <button onClick={() => removeImageField(i)} disabled={imageInputs.length === 1}
                      className="mt-0.5 px-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/10 transition disabled:opacity-20 text-sm">✕</button>
                  </div>
                  {url && toDriveImageUrl(url) && (
                    <div className="mt-1.5 rounded-lg overflow-hidden h-20 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={toDriveImageUrl(url)} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addImageField}
                className="mt-1 w-full py-2 rounded-xl border border-dashed border-white/20 text-white/40 hover:border-green-400/50 hover:text-green-400 transition text-sm">
                + Add image
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={saveTrek} disabled={saving}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={editingId ? { background: "linear-gradient(135deg,#f59e0b,#d97706)" } : { background: "linear-gradient(135deg,#16a34a,#0891b2)" }}>
                {saving ? "Saving…" : editingId ? "Save Changes 💾" : "Save Trek ✅"}
              </button>
              
              {editingId && (
                <button onClick={resetForm}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition">
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Treks List ─────────────────── */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-wide">Manage Treks</h2>
            <button onClick={logout}
              className="hidden lg:block text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/10 transition">
              Logout
            </button>
          </div>

          {loadingTreks ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => <div key={n} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : treksList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
              <p className="text-white/40">No treks found. Add one on the left!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {treksList.map((t) => {
                const isEditingThis = editingId === t.id;
                return (
                  <div key={t.id}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${isEditingThis ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate text-white/90">{t.name}</h3>
                        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${t.status === "upcoming" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 truncate mt-1">
                        {t.date} · {t.location} · ₹{t.price}
                        {t.leader && ` · Leader: ${t.leader}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleEdit(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isEditingThis ? "bg-amber-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"}`}>
                        {isEditingThis ? "Editing.." : "Edit"}
                      </button>
                      
                      <button onClick={() => handleDelete(t.id!, t.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}