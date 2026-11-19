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

