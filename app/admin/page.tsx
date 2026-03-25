"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";


export default function Admin() {
  const [trek, setTrek] = useState({
    name: "",
    date: "",
    location: "",
    price: "",
    status: "upcoming",
    image: "",
  });

  // 🔐 Protect admin
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/login";
      }
    });
  }, []);

  const saveTrek = async () => {
    await addDoc(collection(db, "treks"), trek);
    alert("Trek Added ✅");

    setTrek({
      name: "",
      date: "",
      location: "",
      price: "",
      status: "upcoming",
      image: "",
    });
  };

  // 🚪 Logout
  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-md mx-auto bg-white p-5 rounded-xl shadow">

        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button onClick={logout} className="text-red-500 text-sm">
            Logout
          </button>
        </div>

        <input
          placeholder="Trek Name"
          className="border p-2 w-full mb-2 rounded"
          value={trek.name}
          onChange={(e) => setTrek({ ...trek, name: e.target.value })}
        />

        <input
          type="date"
          className="border p-2 w-full mb-2 rounded"
          value={trek.date}
          onChange={(e) => setTrek({ ...trek, date: e.target.value })}
        />

        <input
          placeholder="Location"
          className="border p-2 w-full mb-2 rounded"
          value={trek.location}
          onChange={(e) => setTrek({ ...trek, location: e.target.value })}
        />

        <input
          placeholder="Price"
          className="border p-2 w-full mb-2 rounded"
          value={trek.price}
          onChange={(e) => setTrek({ ...trek, price: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-2 rounded"
          value={trek.status}
          onChange={(e) => setTrek({ ...trek, status: e.target.value })}
        >
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>

        <input
          placeholder="Image URL"
          className="border p-2 w-full mb-3 rounded"
          value={trek.image}
          onChange={(e) => setTrek({ ...trek, image: e.target.value })}
        />

        <button
          onClick={saveTrek}
          className="bg-green-600 text-white p-2 w-full rounded"
        >
          Save Trek
        </button>
      </div>
    </div>
  );
}