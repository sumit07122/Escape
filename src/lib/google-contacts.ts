/**
 * Google Contacts & People API Integration Module for Himalayan Escape
 *
 * Implements:
 * - Scopes: https://www.googleapis.com/auth/contacts.readonly
 * - Endpoint: https://people.googleapis.com/v1/people/me/connections
 * - Pagination via nextPageToken
 * - Robust normalization for Names, Phone numbers, Emails, and Photos
 * - Token revocation
 *
 * Security:
 * - In-memory access token only
 * - Never persists access tokens or full address books to disk/database
 */

export const GOOGLE_CONTACTS_SCOPE = 'https://www.googleapis.com/auth/contacts.readonly';
export const PEOPLE_API_CONNECTIONS_URL = 'https://people.googleapis.com/v1/people/me/connections';

export interface NormalizedPhoneNumber {
  value: string;
  type?: string;
  formattedValue?: string;
}

export interface NormalizedEmailAddress {
  value: string;
  type?: string;
}

export interface NormalizedContact {
  resourceName: string;
  etag?: string;
  displayName: string;
  givenName?: string;
  familyName?: string;
  primaryPhone: string;
  primaryEmail: string;
  photoUrl?: string;
  phoneNumbers: NormalizedPhoneNumber[];
  emailAddresses: NormalizedEmailAddress[];
}

export interface GooglePeopleConnectionsResponse {
  connections?: Array<any>;
  nextPageToken?: string;
  nextSyncToken?: string;
  totalPeople?: number;
  totalItems?: number;
}

/**
 * Clean and normalize phone numbers:
 * - Strips unwanted characters except + and digits
 * - Extracts clean 10-digit number when possible
 */
export function cleanPhoneNumber(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  const trimmed = rawPhone.trim();
  // Strip spaces, dashes, parentheses
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');
  
  // If Indian format +91XXXXXXXXXX or 0XXXXXXXXXX, extract 10 digits
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) {
    return cleaned.slice(3);
  }
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return cleaned.slice(1);
  }
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return cleaned;
  }
  
  return cleaned;
}

/**
 * Normalize an individual Google People API Person record
 */
export function normalizePerson(person: any): NormalizedContact | null {
  if (!person || typeof person !== 'object') return null;

  const resourceName = person.resourceName || `people/${Date.now()}`;
  const etag = person.etag;

  // Extract Name
  let displayName = '';
  let givenName = '';
  let familyName = '';

  if (Array.isArray(person.names) && person.names.length > 0) {
    const primaryName = person.names.find((n: any) => n.metadata?.primary) || person.names[0];
    displayName = primaryName.displayName || primaryName.unstructuredName || '';
    givenName = primaryName.givenName || '';
    familyName = primaryName.familyName || '';
  }

  // Extract Phones
  const phoneNumbers: NormalizedPhoneNumber[] = [];
  if (Array.isArray(person.phoneNumbers)) {
    for (const p of person.phoneNumbers) {
      if (p.value) {
        phoneNumbers.push({
          value: cleanPhoneNumber(p.value),
          type: p.type || p.formattedType || 'Mobile',
          formattedValue: p.canonicalForm || p.value,
        });
      }
    }
  }

  // Extract Emails
  const emailAddresses: NormalizedEmailAddress[] = [];
  if (Array.isArray(person.emailAddresses)) {
    for (const e of person.emailAddresses) {
      if (e.value) {
        emailAddresses.push({
          value: e.value.toLowerCase().trim(),
          type: e.type || e.formattedType || 'Email',
        });
      }
    }
  }

  // Extract Photos
  let photoUrl: string | undefined = undefined;
  if (Array.isArray(person.photos) && person.photos.length > 0) {
    const primaryPhoto = person.photos.find((ph: any) => ph.metadata?.primary && !ph.default) || 
      person.photos.find((ph: any) => !ph.default) || 
      person.photos[0];
    if (primaryPhoto?.url) {
      photoUrl = primaryPhoto.url;
    }
  }

  // If no name was provided, fall back to email or primary phone or Unnamed Contact
  if (!displayName) {
    if (emailAddresses.length > 0) {
      displayName = emailAddresses[0].value.split('@')[0];
    } else if (phoneNumbers.length > 0) {
      displayName = phoneNumbers[0].value;
    } else {
      displayName = 'Unnamed Contact';
    }
  }

  const primaryPhone = phoneNumbers.length > 0 ? phoneNumbers[0].value : '';
  const primaryEmail = emailAddresses.length > 0 ? emailAddresses[0].value : '';

  return {
    resourceName,
    etag,
    displayName,
    givenName,
    familyName,
    primaryPhone,
    primaryEmail,
    photoUrl,
    phoneNumbers,
    emailAddresses,
  };
}

/**
 * Normalize an array of Google People API connections
 */
export function normalizePeopleConnections(connections?: Array<any> | null): NormalizedContact[] {
  if (!connections || !Array.isArray(connections)) return [];
  const normalized: NormalizedContact[] = [];

  for (const person of connections) {
    const contact = normalizePerson(person);
    if (contact) {
      normalized.push(contact);
    }
  }

  return normalized;
}

export interface FetchContactsOptions {
  pageSize?: number;
  maxPages?: number;
  pageToken?: string;
}

/**
 * Fetch contacts from Google People API with pagination support
 */
export async function fetchGoogleContacts(
  accessToken: string,
  options: FetchContactsOptions = {}
): Promise<{
  contacts: NormalizedContact[];
  totalPeopleCount: number;
  nextPageToken?: string;
}> {
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('Valid Google OAuth access token is required to fetch contacts.');
  }

  const pageSize = options.pageSize || 1000;
  const maxPages = options.maxPages || 10; // Safety guard for extremely large address books
  let currentPageToken: string | undefined = options.pageToken;
  let pageCount = 0;
  const allContacts: NormalizedContact[] = [];
  let totalPeopleEstimate = 0;
  let lastNextPageToken: string | undefined = undefined;

  do {
    pageCount++;
    const url = new URL(PEOPLE_API_CONNECTIONS_URL);
    url.searchParams.set('personFields', 'names,emailAddresses,phoneNumbers,photos');
    url.searchParams.set('pageSize', pageSize.toString());
    if (currentPageToken) {
      url.searchParams.set('pageToken', currentPageToken);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorJson: any = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // Not JSON
      }

      const status = response.status;
      const message = errorJson?.error?.message || response.statusText || 'Failed to fetch contacts from Google People API';

      if (status === 401) {
        throw new Error(`Google OAuth access token has expired or is invalid. (${message})`);
      }
      if (status === 403) {
        throw new Error(`Contacts permission not granted or Google People API is not enabled. (${message})`);
      }
      throw new Error(`Google People API error (${status}): ${message}`);
    }

    const data: GooglePeopleConnectionsResponse = await response.json();
    totalPeopleEstimate = data.totalPeople || data.totalItems || totalPeopleEstimate;

    if (data.connections && data.connections.length > 0) {
      const parsed = normalizePeopleConnections(data.connections);
      allContacts.push(...parsed);
    }

    currentPageToken = data.nextPageToken;
    lastNextPageToken = data.nextPageToken;
  } while (currentPageToken && pageCount < maxPages && !options.pageToken);

  return {
    contacts: allContacts,
    totalPeopleCount: totalPeopleEstimate || allContacts.length,
    nextPageToken: lastNextPageToken,
  };
}

/**
 * Revoke an OAuth access token with Google
 */
export async function revokeGoogleAccessToken(accessToken: string): Promise<boolean> {
  if (!accessToken) return true;
  try {
    const res = await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

