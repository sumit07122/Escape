'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Bus, Phone, ShieldCheck, MapPin, RefreshCw } from 'lucide-react';

export default function AdminTransportPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/buses');
      if (res.ok) {
        const data = await res.json();
        setBuses(data.buses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransport();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
            LOGISTICS & FLEET OPERATIONS
          </span>
          <h1 className="text-3xl font-black text-white">Transport Fleet Manifest</h1>
          <p className="text-xs text-zinc-400">
            Luxury 2×2 AC coaches, mountain chauffeurs, conductor contacts, and road clearances.
          </p>
        </div>

        <button
          onClick={fetchTransport}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buses.map((bus) => (
          <div key={bus.id} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                  TOURIST COACH
                </span>
                <h2 className="text-2xl font-black text-white">{bus.busNumber}</h2>
                <p className="text-xs text-zinc-400">{bus.vehicleName}</p>
              </div>
              <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-sky-400">
                {bus.vehicleNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-zinc-500 font-bold block">Assigned Chauffeur</span>
                <span className="font-bold text-white text-sm block">{bus.driverName || 'Rajesh Sharma'}</span>
                <span className="text-zinc-400">{bus.driverPhone || '7017936338'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-zinc-500 font-bold block">Conductor</span>
                <span className="font-bold text-white text-sm block">{bus.conductorName || 'Amit Verma'}</span>
                <span className="text-zinc-400">{bus.conductorPhone || '9368287947'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Route:</span>
                <span className="font-semibold text-white">GLA Mathura → Manali → Kasol → Return</span>
              </div>
              <div className="flex justify-between">
                <span>Physical Capacity:</span>
                <span className="font-bold text-zinc-300">25 (23 Passenger + 1 Driver + 1 Conductor)</span>
              </div>
              <div className="flex justify-between">
                <span>Road Status:</span>
                <span className="font-bold text-emerald-400">Certified Tourist Permit & Insured</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
