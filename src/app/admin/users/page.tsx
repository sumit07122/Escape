'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Mail, Phone, RefreshCw, Search, Ticket, Users } from 'lucide-react';

interface RegisteredUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Accounts</span>
          <h1 className="mt-1 text-3xl font-black text-white">Registered users</h1>
          <p className="mt-1 text-xs text-zinc-400">View customer profiles, contact details, and booking activity.</p>
        </div>
        <button
          type="button"
          onClick={() => loadUsers(search, page)}
          disabled={loading}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-xs font-bold text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search name, email, or phone"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-400/50"
            />
          </label>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Users className="h-4 w-4 text-orange-300" />
            <span><strong className="text-white">{total.toLocaleString('en-IN')}</strong> registered {total === 1 ? 'user' : 'users'}</span>
          </div>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-xs text-rose-200">{error}</p>}

        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
          <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_110px_110px] gap-4 bg-zinc-900/80 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 md:grid">
            <span>User</span><span>Contact</span><span>Registered</span><span>Bookings</span><span>Last updated</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-xs text-zinc-400"><RefreshCw className="h-4 w-4 animate-spin" />Loading registered users…</div>
          ) : users.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-zinc-400">{search ? 'No users match that search.' : 'No registered users yet.'}</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {users.map((user) => (
                <article key={user.id} className="grid gap-3 px-4 py-4 text-xs md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_110px_110px] md:items-center md:gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {user.image ? (
                      <img src={user.image} alt="" className="h-10 w-10 shrink-0 rounded-full bg-zinc-800 object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-400/10 text-sm font-bold text-orange-200">
                        {(user.name || user.email || 'U').slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{user.name || 'Name not provided'}</p>
                      <p className="mt-1 truncate text-[10px] text-zinc-500">Customer account</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-zinc-300">
                    {user.email && <p className="flex min-w-0 items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0 text-zinc-500" /><span className="truncate">{user.email}</span></p>}
                    {user.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0 text-zinc-500" />{user.phone}</p>}
                    {!user.email && !user.phone && <span className="text-zinc-500">No contact details</span>}
                  </div>
                  <p className="flex items-center gap-2 text-zinc-300"><CalendarDays className="h-3.5 w-3.5 text-zinc-500 md:hidden" />{formatDate(user.createdAt)}</p>
                  <p className="flex items-center gap-2 font-medium text-zinc-200"><Ticket className="h-3.5 w-3.5 text-zinc-500 md:hidden" />{user._count.bookings} {user._count.bookings === 1 ? 'booking' : 'bookings'}</p>
                  <p className="hidden text-zinc-400 md:block">{formatDate(user.updatedAt)}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-500">Page {page} of {totalPages} · Contact and booking data is visible to admins only.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading} className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 disabled:opacity-40">Previous</button>
            <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages || loading} className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 disabled:opacity-40">Next</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
