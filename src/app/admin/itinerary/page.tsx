'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, RefreshCw, X, Check } from 'lucide-react';

export default function AdminItineraryPage() {
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState<any>(null);
  const [newItemDayId, setNewItemDayId] = useState<string | null>(null);

  // New item form state
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [activity, setActivity] = useState('');
  const [description, setDescription] = useState('');
  const [isOptional, setIsOptional] = useState(false);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/itinerary');
      if (res.ok) {
        const data = await res.json();
        setDays(data.days || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, []);

  const handleUpdateDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;
    try {
      await fetch('/api/admin/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_DAY',
          dayId: editingDay.id,
          title: editingDay.title,
          subtitle: editingDay.subtitle,
          stayLocation: editingDay.stayLocation,
          mealsConfig: editingDay.mealsConfig,
          description: editingDay.description,
        }),
      });
      setEditingDay(null);
      await fetchItinerary();
    } catch {
      alert('Failed to update day');
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDayId) return;
    try {
      await fetch('/api/admin/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_ITEM',
          dayId: newItemDayId,
          time,
          location,
          activity,
          description,
          isOptional,
        }),
      });
      setNewItemDayId(null);
      setTime('');
      setLocation('');
      setActivity('');
      setDescription('');
      setIsOptional(false);
      await fetchItinerary();
    } catch {
      alert('Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this activity?')) return;
    try {
      await fetch('/api/admin/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_ITEM', itemId }),
      });
      await fetchItinerary();
    } catch {
      alert('Failed to delete item');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            LIVE ITINERARY DISPATCH
          </span>
          <h1 className="text-3xl font-black text-white">Itinerary Management</h1>
          <p className="text-xs text-zinc-400">
            Edit day schedules, meals configurations, and activities. Updates reflect instantly on public pages.
          </p>
        </div>

        <button
          onClick={fetchItinerary}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-6">
        {days.map((day) => (
          <div key={day.id} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-black text-xs">
                    DAY 0{day.dayNumber}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">{day.stayLocation}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{day.title}</h2>
                <p className="text-xs text-amber-400 font-medium">{day.mealsConfig}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingDay(day)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Day</span>
                </button>
                <button
                  onClick={() => setNewItemDayId(day.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity</span>
                </button>
              </div>
            </div>

            {/* Activities Table */}
            <div className="space-y-2">
              {day.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">{item.time || 'TBD'}</span>
                      <span className="font-bold text-white">{item.activity}</span>
                      {item.isOptional && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-950 text-amber-300">
                          Optional
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 text-[11px]">{item.location} • {item.description}</div>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Day Modal */}
      {editingDay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-3xl border border-zinc-700 max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white">Edit Day {editingDay.dayNumber}</h3>
              <button onClick={() => setEditingDay(null)} className="p-2 text-zinc-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUpdateDay} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Title</label>
                <input
                  type="text"
                  value={editingDay.title}
                  onChange={(e) => setEditingDay({ ...editingDay, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Stay Location</label>
                <input
                  type="text"
                  value={editingDay.stayLocation || ''}
                  onChange={(e) => setEditingDay({ ...editingDay, stayLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Meals Config</label>
                <input
                  type="text"
                  value={editingDay.mealsConfig || ''}
                  onChange={(e) => setEditingDay({ ...editingDay, mealsConfig: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Description</label>
                <textarea
                  rows={3}
                  value={editingDay.description || ''}
                  onChange={(e) => setEditingDay({ ...editingDay, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs mt-2">
                Save Day Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {newItemDayId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-3xl border border-zinc-700 max-w-md w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white">Add Itinerary Activity</h3>
              <button onClick={() => setNewItemDayId(null)} className="p-2 text-zinc-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1 font-bold">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1 font-bold">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Solang Valley"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Activity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solang Paragliding & Cable Car"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed guidelines or instructions"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="opt"
                  checked={isOptional}
                  onChange={(e) => setIsOptional(e.target.checked)}
                  className="rounded border-zinc-700"
                />
                <label htmlFor="opt" className="text-zinc-300 font-semibold cursor-pointer">
                  Mark as Optional Activity
                </label>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs mt-2">
                Save Activity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
