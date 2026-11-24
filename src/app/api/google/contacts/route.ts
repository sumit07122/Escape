export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { fetchGoogleContacts, revokeGoogleAccessToken } from '@/lib/google-contacts';

/**
 * POST /api/google/contacts
 * Fetches contacts from Google People API using the in-memory access token.
 * Access token is transmitted securely via Authorization Bearer header or request body.
 */
export async function POST(request: NextRequest) {
  try {
    let accessToken = '';

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim();
    }

    let body: any = {};
    try {
      body = await request.json();
      if (!accessToken && body.accessToken) {
        accessToken = body.accessToken.trim();
      }
    } catch {
      // Empty or non-JSON body is acceptable if Bearer header is present
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing Google OAuth access token in Authorization header or body' },
        { status: 401 }
      );
    }

    // Demo Mode or Sandbox fallback when OAuth secrets are in test mode
    if (accessToken.startsWith('demo_')) {
      const demoContacts = [
        {
          resourceName: 'people/demo_rahul',
          displayName: 'Rahul Sharma',
          givenName: 'Rahul',
          familyName: 'Sharma',
          primaryPhone: '9876543210',
          primaryEmail: 'rahul.sharma@gla.ac.in',
          phoneNumbers: [{ value: '9876543210', type: 'mobile', formattedValue: '+91 98765 43210' }],
          emailAddresses: [{ value: 'rahul.sharma@gla.ac.in', type: 'student' }],
        },
        {
          resourceName: 'people/demo_priya',
          displayName: 'Priya Patel',
          givenName: 'Priya',
          familyName: 'Patel',
          primaryPhone: '9876543211',
          primaryEmail: 'priya.patel@gla.ac.in',
          phoneNumbers: [{ value: '9876543211', type: 'mobile', formattedValue: '+91 98765 43211' }],
          emailAddresses: [{ value: 'priya.patel@gla.ac.in', type: 'student' }],
        },
        {
          resourceName: 'people/demo_aman',
          displayName: 'Aman Verma',
          givenName: 'Aman',
          familyName: 'Verma',
          primaryPhone: '9876543212',
          primaryEmail: 'aman.verma@gla.ac.in',
          phoneNumbers: [{ value: '9876543212', type: 'mobile', formattedValue: '+91 98765 43212' }],
          emailAddresses: [{ value: 'aman.verma@gla.ac.in', type: 'student' }],
        },
        {
          resourceName: 'people/demo_shrikant',
          displayName: 'Shrikant Tiwari',
          givenName: 'Shrikant',
          familyName: 'Tiwari',
          primaryPhone: '9876543213',
          primaryEmail: 'shrikant@gla.ac.in',
          phoneNumbers: [{ value: '9876543213', type: 'mobile', formattedValue: '+91 98765 43213' }],
          emailAddresses: [{ value: 'shrikant@gla.ac.in', type: 'student' }],
        },
        {
          resourceName: 'people/demo_neha',
          displayName: 'Neha Singh',
          givenName: 'Neha',
          familyName: 'Singh',
          primaryPhone: '9876543214',
          primaryEmail: 'neha.singh@gla.ac.in',
          phoneNumbers: [{ value: '9876543214', type: 'mobile', formattedValue: '+91 98765 43214' }],
          emailAddresses: [{ value: 'neha.singh@gla.ac.in', type: 'student' }],
        },
        {
          resourceName: 'people/demo_parent',
          displayName: 'Rajesh Sharma (Father)',
          givenName: 'Rajesh',
          familyName: 'Sharma',
          primaryPhone: '9876500001',
          primaryEmail: 'parent.sharma@gmail.com',
          phoneNumbers: [{ value: '9876500001', type: 'home', formattedValue: '+91 98765 00001' }],
          emailAddresses: [{ value: 'parent.sharma@gmail.com', type: 'personal' }],
        },
      ];

      return NextResponse.json({
        success: true,
        contacts: demoContacts,
        totalCount: demoContacts.length,
        nextPageToken: null,
      });
    }

    const pageSize = typeof body.pageSize === 'number' ? body.pageSize : 1000;
    const pageToken = typeof body.pageToken === 'string' ? body.pageToken : undefined;

    const result = await fetchGoogleContacts(accessToken, { pageSize, pageToken });

    return NextResponse.json({
      success: true,
      contacts: result.contacts,
      totalCount: result.totalPeopleCount,
      nextPageToken: result.nextPageToken || null,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch contacts from Google People API';
    console.error('[GOOGLE_CONTACTS_API_ERROR]:', message);

    const isAuthError = message.includes('expired') || message.includes('invalid') || message.includes('401');
    const isPermissionError = message.includes('permission') || message.includes('not granted') || message.includes('403');

    return NextResponse.json(
      {
        success: false,
        error: message,
        isAuthError,
        isPermissionError,
      },
      { status: isAuthError ? 401 : isPermissionError ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/google/contacts
 * Revokes Google OAuth access token for security & privacy
 */
export async function DELETE(request: NextRequest) {
  try {
    let accessToken = '';

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim();
    }

    if (!accessToken) {
      try {
        const body = await request.json();
        if (body.accessToken) accessToken = body.accessToken.trim();
      } catch {
        // No body
      }
    }

    if (!accessToken) {
      return NextResponse.json({ success: true, message: 'No active token to revoke' });
    }

    const revoked = await revokeGoogleAccessToken(accessToken);
    return NextResponse.json({ success: revoked });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to revoke token' }, { status: 500 });
  }
}

