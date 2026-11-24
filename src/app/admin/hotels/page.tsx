'use client';

import React, { useState, useEffect } from 'react';
import {
  Hotel as HotelIcon,
  Plus,
  UserPlus,
  Users,
  Trash2,
  RefreshCw,
  X,
  Edit2,
  Building2,
  MapPin,
  Phone,
  Bed,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface RoomAssignment {
  id: string;
  roomId: string;
  travellerId: string;
  bookingId: string;
  traveller?: {
    id: string;
    fullName: string;
    gender?: string;
  };
  booking?: {
    bookingId: string;
  };
}

interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  notes?: string | null;
  assignments: RoomAssignment[];
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  address?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  rooms: Room[];
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [confirmedTravellers, setConfirmedTravellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [assignTravellerId, setAssignTravellerId] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Edit / Add Hotel Modal
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [hotelForm, setHotelForm] = useState({
    name: '',
    location: 'Manali',
    address: '',
    contactPerson: '',
    contactPhone: '',
  });

  // Edit / Add Room Modal
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [targetHotelId, setTargetHotelId] = useState<string>('');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    roomType: 'Triple Sharing',
    capacity: 3,
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

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
      setFeedback({ type: 'error', message: 'Failed to fetch hotels from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Open Hotel Modal (Add or Edit)
  const handleOpenHotelModal = (hotel?: Hotel) => {
    if (hotel) {
      setEditingHotel(hotel);
      setHotelForm({
        name: hotel.name,
        location: hotel.location,
        address: hotel.address || '',
        contactPerson: hotel.contactPerson || '',
        contactPhone: hotel.contactPhone || '',
      });
    } else {
      setEditingHotel(null);
      setHotelForm({
        name: '',
        location: 'Manali',
        address: '',
        contactPerson: '',
        contactPhone: '',
      });
    }
    setHotelModalOpen(true);
  };

  // Save Hotel (Create or Update)
  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const isEdit = !!editingHotel;
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isEdit ? 'UPDATE_HOTEL' : 'CREATE_HOTEL',
          hotelId: editingHotel?.id,
          ...hotelForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', isEdit ? 'Hotel details updated successfully.' : 'New hotel added successfully.');
        setHotelModalOpen(false);
        await fetchHotels();
      } else {
        showFeedback('error', data.error || 'Failed to save hotel.');
      }
    } catch {
      showFeedback('error', 'Network error saving hotel.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Hotel
  const handleDeleteHotel = async (hotel: Hotel) => {
    if (!window.confirm(`Are you sure you want to delete "${hotel.name}"? All rooms under this hotel will also be removed.`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_HOTEL',
          hotelId: hotel.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', `Hotel "${hotel.name}" removed.`);
        await fetchHotels();
      } else {
        showFeedback('error', data.error || 'Failed to delete hotel.');
      }
    } catch {
      showFeedback('error', 'Network error deleting hotel.');
    }
  };

  // Open Room Modal (Add or Edit)
  const handleOpenRoomModal = (hotelId: string, room?: Room) => {
    setTargetHotelId(hotelId);
    if (room) {
      setEditingRoom(room);
      setRoomForm({
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        capacity: room.capacity,
        notes: room.notes || '',
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        roomNumber: '',
        roomType: 'Triple Sharing',
        capacity: 3,
        notes: '',
      });
    }
    setRoomModalOpen(true);
  };

  // Save Room (Create or Update)
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const isEdit = !!editingRoom;
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isEdit ? 'UPDATE_ROOM' : 'CREATE_ROOM',
          hotelId: targetHotelId,
          roomId: editingRoom?.id,
          ...roomForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', isEdit ? `Room ${roomForm.roomNumber} updated.` : `Room ${roomForm.roomNumber} added.`);
        setRoomModalOpen(false);
        await fetchHotels();
      } else {
        showFeedback('error', data.error || 'Failed to save room.');
      }
    } catch {
      showFeedback('error', 'Network error saving room.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (room: Room) => {
    if (!window.confirm(`Delete Room ${room.roomNumber}? Any allotted travellers will be unassigned.`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_ROOM',
          roomId: room.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', `Room ${room.roomNumber} removed.`);
        await fetchHotels();
      } else {
        showFeedback('error', data.error || 'Failed to delete room.');
      }
    } catch {
      showFeedback('error', 'Network error deleting room.');
    }
  };

  // Assign Traveller to Room
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
        showFeedback('success', `Allotted ${traveller.fullName} to Room ${selectedRoom.roomNumber}.`);
        await fetchHotels();
      } else {
        const data = await res.json();
        showFeedback('error', data.error || 'Assignment failed.');
      }
    } catch {
      showFeedback('error', 'Error assigning room.');
    }
  };

  // Remove Traveller Assignment
  const handleRemoveAssignment = async (roomId: string, travellerId: string, travellerName: string) => {
    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REMOVE_ASSIGNMENT',
          roomId,
          travellerId,
        }),
      });
      if (res.ok) {
        showFeedback('success', `Removed ${travellerName} from room.`);
        await fetchHotels();
      } else {
        showFeedback('error', 'Failed to remove assignment.');
      }
    } catch {
      showFeedback('error', 'Error removing assignment.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-sans font-bold text-amber-400 uppercase tracking-widest">
              HOSPITALITY MANAGEMENT
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-sans font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Desks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Hotels & Room Allotment
          </h1>
          <p className="text-xs text-stone-300 mt-0.5">
            Manage properties in Manali & Kasol, room occupancies, contact hosts, and roommate assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenHotelModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hotel</span>
          </button>
          <button
            onClick={fetchHotels}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-xs font-bold text-stone-300 hover:text-white transition disabled:opacity-50"
            title="Refresh hotel & room state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-stone-400 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* Hotels Grid */}
      <div className="space-y-6">
        {hotels.length === 0 && !loading && (
          <div className="p-8 text-center rounded-2xl border border-white/10 bg-stone-900/40 text-stone-400 text-xs space-y-3">
            <Building2 className="w-8 h-8 text-stone-500 mx-auto" />
            <p>No hotel properties registered yet. Click &quot;Add Hotel&quot; above to add your first stay.</p>
          </div>
        )}

        {hotels.map((hotel) => {
          const totalBeds = hotel.rooms.reduce((sum, r) => sum + r.capacity, 0);
          const occupiedBeds = hotel.rooms.reduce((sum, r) => sum + (r.assignments?.length || 0), 0);

          return (
            <div
              key={hotel.id}
              className="rounded-3xl p-6 sm:p-7 border border-white/10 bg-stone-900/70 shadow-xl space-y-5"
            >
              {/* Hotel Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-sans font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                      {hotel.location}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {hotel.name}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400 pt-1">
                    {hotel.address && (
                      <span className="flex items-center gap-1 text-stone-300">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        {hotel.address}
                      </span>
                    )}
                    {hotel.contactPerson && (
                      <span className="flex items-center gap-1 text-stone-300">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        Host: <strong className="text-white">{hotel.contactPerson}</strong>
                        {hotel.contactPhone && (
                          <a
                            href={`tel:${hotel.contactPhone}`}
                            className="text-emerald-400 font-mono hover:underline ml-1"
                          >
                            ({hotel.contactPhone})
                          </a>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hotel Actions */}
                <div className="flex items-center gap-2 shrink-0 self-start">
                  <button
                    onClick={() => handleOpenRoomModal(hotel.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-white/10 text-xs font-bold transition"
                    title="Add room to this hotel"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add Room</span>
                  </button>
                  <button
                    onClick={() => handleOpenHotelModal(hotel)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 border border-white/10 text-xs font-bold transition"
                    title="Edit hotel details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteHotel(hotel)}
                    className="p-2 rounded-xl bg-stone-800/80 hover:bg-rose-950/60 border border-white/10 hover:border-rose-500/40 text-stone-400 hover:text-rose-300 transition"
                    title="Delete hotel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Occupancy Summary Bar */}
              <div className="flex items-center justify-between text-xs px-4 py-2.5 rounded-xl bg-stone-950/60 border border-white/5">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-emerald-400" />
                  <span className="text-stone-300">
                    Total Rooms: <strong className="text-white font-mono">{hotel.rooms.length}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-stone-400">Occupancy:</span>
                  <span className="text-emerald-400 font-bold">
                    {occupiedBeds} / {totalBeds} Beds ({totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}%)
                  </span>
                </div>
              </div>

              {/* Rooms Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotel.rooms.length === 0 && (
                  <div className="sm:col-span-2 lg:col-span-3 p-5 rounded-2xl bg-stone-950/40 border border-dashed border-white/10 text-center text-xs text-stone-500">
                    No rooms added yet. Click &quot;Add Room&quot; to configure rooms.
                  </div>
                )}

                {hotel.rooms.map((room) => {
                  const isFull = (room.assignments?.length || 0) >= room.capacity;
                  return (
                    <div
                      key={room.id}
                      className="p-5 rounded-2xl bg-stone-950/90 border border-white/10 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-white">
                              Room {room.roomNumber}
                            </span>
                            <button
                              onClick={() => handleOpenRoomModal(hotel.id, room)}
                              className="text-stone-500 hover:text-amber-400 p-1"
                              title="Edit room specs"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                          <span
                            className={`text-[10px] font-sans tabular-nums font-bold px-2 py-0.5 rounded border ${
                              isFull
                                ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                                : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {room.assignments?.length || 0} / {room.capacity} Beds
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 block mt-0.5">{room.roomType}</span>

                        {/* Roommates list */}
                        <div className="mt-3 space-y-1.5 pt-2 border-t border-white/5">
                          {room.assignments?.length === 0 ? (
                            <span className="text-[11px] text-stone-600 italic block py-1">
                              No travellers allotted yet
                            </span>
                          ) : (
                            room.assignments.map((a) => (
                              <div
                                key={a.id}
                                className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-stone-900 border border-white/5"
                              >
                                <span className="font-semibold text-stone-200 truncate max-w-[150px]">
                                  {a.traveller?.fullName || 'Guest Traveller'}
                                </span>
                                <button
                                  onClick={() => handleRemoveAssignment(room.id, a.travellerId, a.traveller?.fullName || 'Guest')}
                                  className="text-stone-500 hover:text-rose-400 p-1"
                                  title="Remove from room"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2 border-t border-white/5 mt-2">
                        {!isFull ? (
                          <button
                            onClick={() => {
                              setSelectedRoom(room);
                              setAssignModalOpen(true);
                            }}
                            className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-[#183c31] text-emerald-300 border border-white/10 hover:border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Allot Traveller</span>
                          </button>
                        ) : (
                          <div className="flex-1 text-center py-2 text-[10px] font-mono text-stone-500">
                            Room Full
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteRoom(room)}
                          className="p-2 rounded-xl bg-stone-900 hover:bg-rose-950/60 text-stone-500 hover:text-rose-400 border border-white/5 transition"
                          title="Delete room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 1. HOTEL EDIT / CREATE MODAL                               */}
      {/* ========================================================= */}
      {hotelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1715] rounded-3xl border border-white/15 max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  {editingHotel ? 'UPDATE PROPERTY' : 'NEW RESORT SETUP'}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {editingHotel ? 'Edit Hotel Details' : 'Add New Hotel'}
                </h3>
              </div>
              <button
                onClick={() => setHotelModalOpen(false)}
                className="text-stone-400 hover:text-white p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="space-y-3.5 text-xs">
              <div>
                <label className="text-stone-300 mb-1 block font-bold">Hotel / Resort Name</label>
                <input
                  type="text"
                  required
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  placeholder="e.g. Snow Valley Pine Resort & Spa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-stone-300 mb-1 block font-bold">Destination / Location</label>
                <select
                  required
                  value={hotelForm.location}
                  onChange={(e) => setHotelForm({ ...hotelForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Manali">Manali</option>
                  <option value="Kasol">Kasol</option>
                  <option value="Solang">Solang Valley</option>
                  <option value="Transit">Transit Stop</option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 mb-1 block font-bold">Address & Landmark</label>
                <input
                  type="text"
                  value={hotelForm.address}
                  onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                  placeholder="e.g. Log Huts Area, Old Manali Road, Manali, HP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Contact Manager / Host</label>
                  <input
                    type="text"
                    value={hotelForm.contactPerson}
                    onChange={(e) => setHotelForm({ ...hotelForm, contactPerson: e.target.value })}
                    placeholder="e.g. Vikram Negi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Host Phone Number</label>
                  <input
                    type="tel"
                    value={hotelForm.contactPhone}
                    onChange={(e) => setHotelForm({ ...hotelForm, contactPhone: e.target.value })}
                    placeholder="e.g. 7017936338"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setHotelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-stone-300 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingHotel ? 'Save Changes' : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ROOM EDIT / CREATE MODAL                                */}
      {/* ========================================================= */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1715] rounded-3xl border border-white/15 max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  {editingRoom ? 'UPDATE ROOM' : 'NEW ROOM CONFIG'}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add Room to Hotel'}
                </h3>
              </div>
              <button
                onClick={() => setRoomModalOpen(false)}
                className="text-stone-400 hover:text-white p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Room Number / ID</label>
                  <input
                    type="text"
                    required
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    placeholder="e.g. 101, 102, Cabin A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Bed Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 mb-1 block font-bold">Sharing Category / Room Type</label>
                <select
                  required
                  value={roomForm.roomType}
                  onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Triple Sharing">Triple Sharing (3 Beds)</option>
                  <option value="Quad Sharing">Quad Sharing (4 Beds)</option>
                  <option value="Double Sharing">Double Sharing (2 Beds)</option>
                  <option value="Deluxe Riverside Suite">Deluxe Riverside Suite</option>
                  <option value="Alpine Wooden Cottage">Alpine Wooden Cottage</option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 mb-1 block font-bold">Notes / Location Details</label>
                <input
                  type="text"
                  value={roomForm.notes}
                  onChange={(e) => setRoomForm({ ...roomForm, notes: e.target.value })}
                  placeholder="e.g. 2nd Floor, River view, Attached balcony"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-stone-300 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingRoom ? 'Save Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ROOM ALLOTMENT MODAL                                    */}
      {/* ========================================================= */}
      {assignModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1715] rounded-3xl border border-white/15 max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider">
                  ROOM ALLOTMENT
                </span>
                <h3 className="text-lg font-bold text-white">Allot to Room {selectedRoom.roomNumber}</h3>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-stone-400 hover:text-white p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTraveller} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-300 mb-1.5 block font-bold">Select Confirmed Traveller</label>
                <select
                  required
                  value={assignTravellerId}
                  onChange={(e) => setAssignTravellerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Traveller --</option>
                  {confirmedTravellers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.gender || 'Pax'} • Seat {t.assignedSeatNumber || 'N/A'}) - #{t.booking?.bookingId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-stone-300 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
                >
                  Confirm Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
