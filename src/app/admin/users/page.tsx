'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays, Mail, Phone, RefreshCw, Search, Ticket, Users,
  Trash2, Edit3, UserPlus, X, Check, AlertTriangle, ShieldCheck,
  MessageCircle, Sparkles
} from 'lucide-react';

interface RegisteredUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  _count: { bookings: number };
}

const formatDate = (value: string) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
}).format(new Date(value));

export default function AdminUsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'leads' | 'booked'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State for Edit / Create User
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('USER');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Bulk Purge State
  const [isPurging, setIsPurging] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadUsers = useCallback(async (query: string, pageNumber: number, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(pageNumber) });
      if (query.trim()) params.set('search', query.trim());
      const response = await fetch(`/api/admin/users?${params}`, { cache: 'no-store', signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load users.');
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (loadError) {
      if (loadError instanceof Error && loadError.name === 'AbortError') return;
      setError(loadError instanceof Error ? loadError.message : 'Could not load users.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => loadUsers(search, page, controller.signal), 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadUsers, page, search]);

  const handleOpenEdit = (user: RegisteredUser) => {
    setEditingUser(user);
    setFormName(user.name || '');
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormRole(user.role || 'USER');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          name: formName,
          email: formEmail,
          phone: formPhone,
          role: formRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      showToast('success', `User ${formName || formEmail} updated successfully`);
      setEditingUser(null);
      loadUsers(search, page);
    } catch (err: any) {
      showToast('error', err.message || 'Error updating user');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phone: formPhone,
          role: formRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      showToast('success', `User ${formName || formEmail} created successfully`);
      setIsCreateOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      loadUsers(search, page);
    } catch (err: any) {
      showToast('error', err.message || 'Error creating user');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: RegisteredUser) => {
    const displayName = user.name || user.email || 'this user';
    if (!window.confirm(`Are you sure you want to delete ${displayName}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      showToast('success', `User ${displayName} deleted successfully`);
      loadUsers(search, page);
    } catch (err: any) {
      showToast('error', err.message || 'Error deleting user');
    }
  };

  const handlePurgeAllUsers = async () => {
    if (!window.confirm(`⚠️ DANGER: Are you sure you want to delete ALL registered users (${total} total)?\n\nAll customer login profiles will be wiped clean. Proceed?`)) return;
    setIsPurging(true);
    try {
      const res = await fetch('/api/admin/users?all=true', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to purge users');
      showToast('success', data.message || 'All registered users purged successfully');
      loadUsers('', 1);
    } catch (err: any) {
      showToast('error', err.message || 'Error purging users');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          <span className="text-xs font-bold">{feedback.message}</span>
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Accounts</span>
          <h1 className="mt-1 text-3xl font-black text-white">Registered users</h1>
          <p className="mt-1 text-xs text-stone-400">View customer profiles, edit user details, and manage registrations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setFormName('');
              setFormEmail('');
              setFormPhone('');
              setFormRole('USER');
              setIsCreateOpen(true);
            }}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-3.5 text-xs font-bold text-stone-950 transition shadow-md cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" /> Add User
          </button>
          <button
            type="button"
            onClick={handlePurgeAllUsers}
            disabled={isPurging || total === 0}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-700/60 bg-rose-950/40 hover:bg-rose-900/60 px-3.5 text-xs font-bold text-rose-300 transition disabled:opacity-50 cursor-pointer"
            title="Delete all registered customer users"
          >
            <Trash2 className="h-3.5 w-3.5" /> {isPurging ? 'Purging…' : 'Purge All Users'}
          </button>
          <button
            type="button"
            onClick={() => loadUsers(search, page)}
            disabled={loading}
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-stone-900 px-3.5 text-xs font-bold text-stone-200 transition hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </header>

      {/* Leads vs Booked KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-950/20'
              : 'bg-stone-900/60 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Accounts</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{total.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">All customer and traveller accounts</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('leads')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterType === 'leads'
              ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-950/30'
              : 'bg-stone-900/60 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Interested Leads
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
              {users.filter((u) => (u._count?.bookings || 0) === 0).length}
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-300">
            {users.filter((u) => (u._count?.bookings || 0) === 0).length}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">Signed up visitors ready for follow-up</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('booked')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterType === 'booked'
              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
              : 'bg-stone-900/60 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Booked Travellers
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              {users.filter((u) => (u._count?.bookings || 0) > 0).length}
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-300">
            {users.filter((u) => (u._count?.bookings || 0) > 0).length}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">Customers with confirmed bookings</p>
        </button>
      </div>

      <section className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:max-w-xl">
            <label className="relative block flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Search name, email, or phone"
                className="w-full rounded-xl border border-white/15 bg-stone-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-400"
              />
            </label>

            {/* Quick Segment Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-950 border border-white/10 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('leads')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === 'leads' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Leads</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('booked')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === 'booked' ? 'bg-emerald-500 text-stone-950 font-black' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Booked</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Users className="h-4 w-4 text-amber-400" />
            <span><strong className="text-white">{total.toLocaleString('en-IN')}</strong> registered {total === 1 ? 'user' : 'users'}</span>
          </div>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-xs text-rose-200">{error}</p>}

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-stone-950/50">
          <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,1fr)_110px_90px_90px] gap-3 bg-stone-950 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 md:grid border-b border-white/10">
            <span>User</span>
            <span>Contact / Outreach</span>
            <span>Registered</span>
            <span>Status / Bookings</span>
            <span>Role</span>
            <span className="text-right">Actions</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-xs text-stone-400">
              <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />Loading registered users…
            </div>
          ) : users.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-stone-400">
              {search ? 'No users match that search.' : 'No registered users in system (Clean state).'}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {users
                .filter((user) => {
                  if (filterType === 'leads') return (user._count?.bookings || 0) === 0;
                  if (filterType === 'booked') return (user._count?.bookings || 0) > 0;
                  return true;
                })
                .map((user) => (
                <article key={user.id} className="grid gap-3 px-4 py-3.5 text-xs md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,1fr)_110px_90px_90px] md:items-center md:gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex min-w-0 items-center gap-3">
                    {user.image ? (
                      <img src={user.image} alt="" className="h-9 w-9 shrink-0 rounded-full bg-stone-800 object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">
                        {(user.name || user.email || 'U').slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{user.name || 'Name not provided'}</p>
                      <p className="truncate text-[10px] text-stone-400 font-mono">ID: {user.id.slice(0, 8)}…</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-stone-300">
                    {user.email && (
                      <p className="flex min-w-0 items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3 shrink-0 text-stone-500" />
                        <span className="truncate">{user.email}</span>
                      </p>
                    )}
                    {user.phone ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <a
                          href={`tel:${user.phone}`}
                          className="flex items-center gap-1 font-mono text-[11px] text-stone-200 hover:text-amber-400 transition"
                          title="Click to Call"
                        >
                          <Phone className="h-3 w-3 shrink-0 text-amber-400" />
                          <span>{user.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/91${user.phone.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                            `Hi ${user.name || 'there'}! Saw your registration for the Himalayan Escape Manali trip. How can we help you plan your journey?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Direct WhatsApp Chat"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/40 text-[10px] font-bold text-emerald-300 hover:bg-emerald-900 transition"
                        >
                          <MessageCircle className="w-2.5 h-2.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    ) : (
                      !user.email && <span className="text-stone-500 text-[11px]">No contact details</span>
                    )}
                  </div>

                  <p className="flex items-center gap-2 text-stone-300">
                    <CalendarDays className="h-3.5 w-3.5 text-stone-500 md:hidden" />
                    {formatDate(user.createdAt)}
                  </p>

                  <div>
                    {user._count.bookings > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        <Check className="w-2.5 h-2.5" /> Booked ({user._count.bookings})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        <Sparkles className="w-2.5 h-2.5" /> Interested Lead
                      </span>
                    )}
                  </div>

                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-amber-950 text-amber-300 border border-amber-600/40' : 'bg-stone-800 text-stone-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit user"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-white transition-colors cursor-pointer"
                      title="Delete user"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-stone-400">Page {page} of {totalPages} · Showing {users.length} of {total} registered users.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-800 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-800 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </footer>
      </section>

      {/* Edit / Create User Modal */}
      {(editingUser || isCreateOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-stone-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingUser ? 'Edit User Profile' : 'Add New User'}
              </h3>
              <button
                type="button"
                onClick={() => { setEditingUser(null); setIsCreateOpen(false); }}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleSaveEdit : handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. rahul@gla.ac.in"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">Phone Number</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">User Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="USER">Customer User (USER)</option>
                  <option value="ADMIN">Administrator (ADMIN)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setEditingUser(null); setIsCreateOpen(false); }}
                  className="px-4 py-2 rounded-xl border border-white/10 text-stone-300 text-xs font-bold hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'Saving…' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
