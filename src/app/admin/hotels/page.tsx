'use client';

import React, { useState, useEffect } from 'react';
import { Hotel as HotelIcon, Plus, UserPlus, Users, Trash2, RefreshCw, X } from 'lucide-react';

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [confirmedTravellers, setConfirmedTravellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [assignTravellerId, setAssignTravellerId] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/hotels');
      if (res.ok) {
        const data = await res.json();
        setHotels(data.hotels || []);
        setConfirmedTravellers(data.confirmedTravellers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleAssignTraveller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !assignTravellerId) return;

    const traveller = confirmedTravellers.find((t) => t.id === assignTravellerId);
    if (!traveller) return;

    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_ROOM',
          roomId: selectedRoom.id,
          travellerId: traveller.id,
          bookingId: traveller.bookingId,
        }),
      });

      if (res.ok) {
        setAssignModalOpen(false);
        setAssignTravellerId('');
        await fetchHotels();
      } else {
        const data = await res.json();
        alert(data.error || 'Assignment failed');
      }
    } catch {
      alert('Error assigning room');
    }
  };

  const handleRemoveAssignment = async (roomId: string, travellerId: string) => {
    try {
      await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REMOVE_ASSIGNMENT',
          roomId,
          travellerId,
        }),
      });
      await fetchHotels();
    } catch {
      alert('Error removing assignment');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            HOSPITALITY MANAGEMENT
          </span>
          <h1 className="text-3xl font-black text-white">Hotels & Room Allotment</h1>
          <p className="text-xs text-zinc-400">
            Resorts in Manali & Kasol, room occupancies, and roommate assignments.
          </p>
        </div>

        <button
          onClick={fetchHotels}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-8">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 uppercase">
                  {hotel.location}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">{hotel.name}</h2>
                <p className="text-xs text-zinc-400">{hotel.address} • Contact: {hotel.contactPerson} ({hotel.contactPhone})</p>
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotel.rooms?.map((room: any) => {
                const isFull = (room.assignments?.length || 0) >= room.capacity;
                return (
                  <div
                    key={room.id}
                    className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-white">Room {room.roomNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isFull ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'
                        }`}>
                          {room.assignments?.length || 0} / {room.capacity} Beds
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">{room.roomType}</span>

                      {/* Roommates list */}
                      <div className="mt-3 space-y-1.5 pt-2 border-t border-zinc-900">
                        {room.assignments?.length === 0 ? (
                          <span className="text-[11px] text-zinc-600 italic">No travellers allotted yet</span>
                        ) : (
                          room.assignments.map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-zinc-900">
                              <span className="font-semibold text-zinc-200 truncate max-w-[150px]">
                                {a.traveller?.fullName}
                              </span>
                              <button
                                onClick={() => handleRemoveAssignment(room.id, a.travellerId)}
                                className="text-zinc-500 hover:text-rose-400 p-0.5"
                                title="Remove from room"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {!isFull && (
                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setAssignModalOpen(true);
                        }}
                        className="w-full mt-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Allot Traveller</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Room Allotment Modal */}
      {assignModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-3xl border border-zinc-700 max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase">Room Allocation</span>
                <h3 className="text-lg font-black text-white">Allot to Room {selectedRoom.roomNumber}</h3>
              </div>
              <button onClick={() => setAssignModalOpen(false)} className="p-2 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTraveller} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 mb-1.5 block font-bold">Select Confirmed Traveller</label>
                <select
                  required
                  value={assignTravellerId}
                  onChange={(e) => setAssignTravellerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                >
                  <option value="">-- Choose Traveller --</option>
                  {confirmedTravellers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.gender} • Seat {t.assignedSeatNumber || 'N/A'}) - #{t.booking?.bookingId}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg mt-2"
              >
                Confirm Room Assignment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
