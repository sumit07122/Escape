'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  X, Search, UserCheck, AlertCircle, Loader2, Phone, Mail,
  LogOut, ShieldCheck, Check, Sparkles, RefreshCw, ExternalLink
} from 'lucide-react';
import { NormalizedContact } from '@/lib/google-contacts';
import { requestGoogleContactsAccess, GoogleAuthProvider } from '@/lib/firebase-auth';

interface GoogleContactsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: { name: string; phone: string; email: string }) => void;
  targetLabel?: string;
  inMemoryAccessToken: string | null;
  onTokenChange: (token: string | null) => void;
}

export default function GoogleContactsImportModal({
  isOpen,
  onClose,
  onSelectContact,
  targetLabel = 'Traveller Details',
  inMemoryAccessToken,
  onTokenChange,
}: GoogleContactsImportModalProps) {
  const [contacts, setContacts] = useState<NormalizedContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlyWithPhone, setFilterOnlyWithPhone] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'FETCHING' | 'READY' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Fetch contacts using current in-memory token
  const loadContactsWithToken = async (token: string) => {
    setLoading(true);
    setStatus('FETCHING');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/google/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pageSize: 1000 }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isAuthError) {
          onTokenChange(null);
          setStatus('IDLE');
          setErrorMessage('Your Google session has expired. Please connect again to load contacts.');
        } else if (data.isPermissionError) {
          setStatus('ERROR');
          setErrorMessage('Google Contacts permission was not granted. Please ensure you allow read access.');
        } else {
          setStatus('ERROR');
          setErrorMessage(data.error || 'Failed to retrieve contacts from Google People API.');
        }
        return;
      }

      setContacts(data.contacts || []);
      setStatus('READY');
    } catch {
      setStatus('ERROR');
      setErrorMessage('Network connection error while fetching contacts. Please verify your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  // If token is already in memory when modal opens, load contacts
  useEffect(() => {
    if (isOpen && inMemoryAccessToken && contacts.length === 0 && status !== 'FETCHING') {
      loadContactsWithToken(inMemoryAccessToken);
    } else if (!inMemoryAccessToken && contacts.length > 0) {
      setContacts([]);
      setStatus('IDLE');
    }
  }, [isOpen, inMemoryAccessToken]);

  // Connect Google Contacts via OAuth Popup
  const handleConnect = async () => {
    setLoading(true);
    setStatus('CONNECTING');
    setErrorMessage(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

      const credential = await requestGoogleContactsAccess(provider);
      const authResult = GoogleAuthProvider.credentialFromResult(credential);
      const token = authResult?.accessToken;

      if (!token) {
        throw new Error('Could not extract Google OAuth access token from authorization response.');
      }

      onTokenChange(token);
      await loadContactsWithToken(token);
    } catch (err: any) {
      console.error('[GOOGLE_CONTACTS_CONNECT_ERROR]:', err);
      setStatus('ERROR');
      setErrorMessage(err?.message || 'Google Contacts permission was denied or popup was cancelled.');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect & Revoke Access
  const handleDisconnect = async () => {
    if (inMemoryAccessToken) {
      try {
        await fetch('/api/google/contacts', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${inMemoryAccessToken}`,
          },
        });
      } catch {
        // Continue clearing client state even if revoke network fails
      }
    }
    onTokenChange(null);
    setContacts([]);
    setStatus('IDLE');
    setErrorMessage(null);
    setSearchQuery('');
  };

  // Filter contacts by search query & phone filter
  const filteredContacts = useMemo(() => {
    let list = contacts;

    if (filterOnlyWithPhone) {
      list = list.filter((c) => c.primaryPhone && c.primaryPhone.trim().length > 0);
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter((c) => {
      const nameMatch = c.displayName.toLowerCase().includes(query);
      const phoneMatch = c.primaryPhone.includes(query) || c.phoneNumbers.some((p) => p.value.includes(query));
      const emailMatch = c.primaryEmail.toLowerCase().includes(query);
      return nameMatch || phoneMatch || emailMatch;
    });
  }, [contacts, searchQuery, filterOnlyWithPhone]);

  // Handle contact selection
  const handleSelect = (contact: NormalizedContact) => {
    setSelectedContactId(contact.resourceName);
    setTimeout(() => {
      onSelectContact({
        name: contact.displayName,
        phone: contact.primaryPhone,
        email: contact.primaryEmail,
      });
      onClose();
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[#FAF9F5] rounded-3xl border border-[#D8D2C4] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#D8D2C4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#163C32]/10 text-[#163C32] flex items-center justify-center">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-[#171918]">Import Google Contact</h3>
                {inMemoryAccessToken && status === 'READY' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-[#646864]">Autofill for: <span className="font-semibold text-[#163C32]">{targetLabel}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F7F5EF] hover:bg-[#E7E2D8] text-[#171918] flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* STATE: NOT CONNECTED (IDLE or ERROR) */}
          {(!inMemoryAccessToken || status === 'IDLE' || (status === 'ERROR' && contacts.length === 0)) && (
            <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#163C32]/10 text-[#163C32] flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-[#D87945]" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-black text-base text-[#171918]">Connect Your Google Contacts</h4>
                <p className="text-xs text-[#646864] leading-relaxed">
                  Quickly autofill legal passenger names, phone numbers, or emergency contact details directly from your Google address book.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs text-left flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Connection Issue</p>
                    <p className="text-[11px] opacity-90">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#163C32] hover:bg-[#0f2a23] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Google Authorization...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 text-[#D87945]" />
                      <span>Connect Google Contacts</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F7F5EF] hover:bg-[#E7E2D8] text-[#171918] text-xs font-bold border border-[#D8D2C4] transition-colors"
                >
                  Enter Manually Instead
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="pt-3 border-t border-[#E7E2D8] flex flex-col items-center justify-center gap-1.5 text-[11px] text-[#646864] text-center">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#163C32] shrink-0" />
                  <span>Read-only access (contacts.readonly). Address book is processed in-memory only.</span>
                </div>
                <span>
                  See our{' '}
                  <Link href="/privacy-policy" target="_blank" className="text-[#163C32] font-semibold underline">
                    Privacy Policy
                  </Link>{' '}
                  for full data handling disclosures.
                </span>
              </div>
            </div>
          )}

          {/* STATE: CONNECTED & READY (SEARCH & SELECTION) */}
          {inMemoryAccessToken && (status === 'READY' || status === 'FETCHING' || contacts.length > 0) && (
            <div className="space-y-4">
              {/* Controls bar: Search + Phone filter + Disconnect */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#646864] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, phone number, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#171918] placeholder-[#8E8C85] focus:outline-none focus:border-[#163C32]"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#646864] hover:text-[#171918]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[#171918] font-medium text-[11px]">
                      <input
                        type="checkbox"
                        checked={filterOnlyWithPhone}
                        onChange={(e) => setFilterOnlyWithPhone(e.target.checked)}
                        className="rounded border-[#D8D2C4] text-[#163C32] focus:ring-[#163C32]"
                      />
                      <span>Only contacts with phone numbers</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#646864]">
                      {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'} found
                    </span>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
                      title="Revoke Google Contacts connection"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading Indicator */}
              {loading && (
                <div className="p-8 text-center space-y-2 bg-white rounded-2xl border border-[#D8D2C4]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D87945] mx-auto" />
                  <p className="text-xs text-[#646864]">Retrieving contacts from Google People API...</p>
                </div>
              )}

              {/* Contacts List */}
              {!loading && (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {filteredContacts.length === 0 ? (
                    <div className="p-8 text-center space-y-2 bg-white rounded-2xl border border-[#D8D2C4]">
                      <p className="text-xs font-bold text-[#171918]">No contacts match your query</p>
                      <p className="text-[11px] text-[#646864]">
                        {filterOnlyWithPhone
                          ? 'Try unchecking "Only contacts with phone numbers" or searching a different name.'
                          : 'You can enter the traveller information manually in the booking form.'}
                      </p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => {
                      const isSelected = selectedContactId === contact.resourceName;
                      const hasPhone = !!contact.primaryPhone;
                      const initials = contact.displayName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || '?';

                      return (
                        <div
                          key={contact.resourceName}
                          onClick={() => handleSelect(contact)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                              : 'bg-white hover:bg-[#F7F5EF] border-[#D8D2C4] hover:border-[#163C32]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            {contact.photoUrl ? (
                              <img
                                src={contact.photoUrl}
                                alt={contact.displayName}
                                className="w-10 h-10 rounded-full object-cover border border-[#D8D2C4] shrink-0"
                                onError={(e) => {
                                  // Fallback to initials if image fails
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#163C32]/10 text-[#163C32] font-black text-xs flex items-center justify-center shrink-0 border border-[#163C32]/20">
                                {initials}
                              </div>
                            )}

                            {/* Details */}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#171918] truncate">
                                {contact.displayName}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[11px] text-[#646864]">
                                {hasPhone ? (
                                  <span className="flex items-center gap-1 font-mono font-medium text-[#163C32]">
                                    <Phone className="w-3 h-3 text-[#D87945]" />
                                    {contact.primaryPhone}
                                  </span>
                                ) : (
                                  <span className="text-[10px] italic text-[#8E8C85]">No phone number</span>
                                )}
                                {contact.primaryEmail && (
                                  <span className="flex items-center gap-1 truncate text-[#646864]">
                                    <Mail className="w-3 h-3 text-[#646864]" />
                                    <span className="truncate">{contact.primaryEmail}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Select Action */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(contact);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#163C32] hover:bg-[#0f2a23] text-white'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Selected</span>
                              </>
                            ) : (
                              <span>Select</span>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#D8D2C4] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F7F5EF] hover:bg-[#E7E2D8] text-[#171918] font-bold border border-[#D8D2C4] transition-colors"
            >
              Cancel & Enter Manually
            </button>
            <Link
              href="/privacy-policy"
              target="_blank"
              className="text-[11px] text-[#646864] hover:text-[#163C32] underline hidden sm:inline"
            >
              Privacy Policy
            </Link>
          </div>

          {inMemoryAccessToken && status === 'READY' && (
            <button
              type="button"
              onClick={() => inMemoryAccessToken && loadContactsWithToken(inMemoryAccessToken)}
              className="text-[11px] font-bold text-[#163C32] hover:text-[#D87945] flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Contacts</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

