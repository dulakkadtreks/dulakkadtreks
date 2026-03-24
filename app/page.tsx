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

  useEffect(() => {
    const fetchTreks = async () => {
      const snapshot = await getDocs(collection(db, "treks"));
      const data: Trek[] = snapshot.docs.map(doc => doc.data() as Trek);
      setTreks(data);
    };
    fetchTreks();
  }, []);

  const upcoming = treks.filter(t => t.status === "upcoming");
  const completed = treks.filter(t => t.status === "completed");

  return (
    <div className="min-h-screen bg-gray-100 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-5">
        Dullakad Treks 🏔️
      </h1>

      {/* Upcoming */}
      <h2 className="text-lg font-semibold mb-2">Upcoming Treks</h2>

      {upcoming.map((t, i) => (
        <div key={i} className="bg-white shadow rounded-xl mb-4 overflow-hidden">
          {t.image && (
            <img src={t.image} className="w-full h-40 object-cover" />
          )}

          <div className="p-3">
            <h3 className="font-bold text-lg">{t.name}</h3>
            <p className="text-sm text-gray-600">
              {t.date} | {t.location}
            </p>
            <p className="font-semibold mt-1">₹{t.price}</p>

            <a
              href={`https://wa.me/91XXXXXXXXXX?text=Hi I want to join ${t.name}`}
              className="bg-black text-white px-3 py-1 mt-2 inline-block rounded"
            >
              Book Now
            </a>
          </div>
        </div>
      ))}

      {/* Completed */}
      <h2 className="text-lg font-semibold mt-6 mb-2">Previous Treks</h2>

      {completed.map((t, i) => (
        <div key={i} className="bg-gray-200 p-3 rounded mb-3">
          <h3 className="font-bold">{t.name}</h3>
          <p>{t.date} | {t.location}</p>
        </div>
      ))}
    </div>
  );
}