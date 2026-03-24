"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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

    // reset
    setTrek({
      name: "",
      date: "",
      location: "",
      price: "",
      status: "upcoming",
      image: "",
    });
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Trek</h1>

      <input
        placeholder="Trek Name"
        className="border p-2 w-full mb-2"
        value={trek.name}
        onChange={(e) => setTrek({ ...trek, name: e.target.value })}
      />

      <input
        type="date"
        className="border p-2 w-full mb-2"
        value={trek.date}
        onChange={(e) => setTrek({ ...trek, date: e.target.value })}
      />

      <input
        placeholder="Location"
        className="border p-2 w-full mb-2"
        value={trek.location}
        onChange={(e) => setTrek({ ...trek, location: e.target.value })}
      />

      <input
        placeholder="Price"
        className="border p-2 w-full mb-2"
        value={trek.price}
        onChange={(e) => setTrek({ ...trek, price: e.target.value })}
      />

      <select
        className="border p-2 w-full mb-2"
        value={trek.status}
        onChange={(e) => setTrek({ ...trek, status: e.target.value })}
      >
        <option value="upcoming">Upcoming</option>
        <option value="completed">Completed</option>
      </select>

      <input
        placeholder="Image URL"
        className="border p-2 w-full mb-2"
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
  );
}