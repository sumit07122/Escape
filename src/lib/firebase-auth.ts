/**
 * Firebase Auth & GoogleAuthProvider Compatibility Layer for Himalayan Escape
 *
 * Implements the standard Firebase Auth / GoogleAuthProvider signatures
 * while bridging to Google Cloud OAuth 2.0 and Google People API.
 *
 * Adheres strictly to Phase 2 requirements:
 * - GoogleAuthProvider with addScope('https://www.googleapis.com/auth/contacts.readonly')
 * - credentialFromResult() extracting Google OAuth accessToken
 * - Distinguishes between Firebase ID tokens and Google OAuth access tokens
 * - Does not create duplicate user accounts
 */

import { GOOGLE_CONTACTS_SCOPE } from './google-contacts';

export interface OAuthCredential {
  providerId: string;
  signInMethod: string;
  accessToken?: string;
  idToken?: string;
}

export interface UserCredential {
  user: any;
  providerId: string;
  operationType: string;
  credential?: OAuthCredential;
  accessToken?: string;
  idToken?: string;
}

export class GoogleAuthProvider {
  public static PROVIDER_ID = 'google.com';
  public static GOOGLE_SIGN_IN_METHOD = 'google.com';

  private scopes: string[] = ['openid', 'email', 'profile'];
  private customParameters: Record<string, string> = {};

  constructor() {}

  /**
   * Request additional scopes (e.g. https://www.googleapis.com/auth/contacts.readonly)
   */
  public addScope(scope: string): GoogleAuthProvider {
    if (scope && !this.scopes.includes(scope)) {
      this.scopes.push(scope);
    }
    return this;
  }

  public getScopes(): string[] {
    return [...this.scopes];
  }

  public setCustomParameters(customOAuthParameters: Record<string, string>): GoogleAuthProvider {
    this.customParameters = { ...this.customParameters, ...customOAuthParameters };
    return this;
  }

  public getCustomParameters(): Record<string, string> {
    return { ...this.customParameters };
  }

  /**
   * Factory method to create an OAuthCredential from tokens
   */
  public static credential(idToken?: string | null, accessToken?: string | null): OAuthCredential {
    return {
      providerId: GoogleAuthProvider.PROVIDER_ID,
      signInMethod: GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD,
      accessToken: accessToken || undefined,
      idToken: idToken || undefined,
    };
  }

  /**
   * Extracts Google OAuth credential and Access Token from auth result.
   * Never confuses Firebase ID tokens with Google OAuth access tokens.
   */
  public static credentialFromResult(userCredential: UserCredential | any): OAuthCredential | null {
    if (!userCredential) return null;

    if (userCredential.credential && userCredential.credential.accessToken) {
      return {
        providerId: GoogleAuthProvider.PROVIDER_ID,
        signInMethod: GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD,
        accessToken: userCredential.credential.accessToken,
        idToken: userCredential.credential.idToken,
      };
    }

    if (userCredential.accessToken) {
      return {
        providerId: GoogleAuthProvider.PROVIDER_ID,
        signInMethod: GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD,
        accessToken: userCredential.accessToken,
        idToken: userCredential.idToken,
      };
    }

    return null;
  }
}

/**
 * Helper to construct an authorization URL for Google OAuth popup
 */
export function buildGoogleOAuthUrl(options: {
  clientId: string;
  redirectUri: string;
  scopes?: string[];
  state?: string;
  prompt?: string;
}): string {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', options.clientId);
  url.searchParams.set('redirect_uri', options.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', (options.scopes || ['openid', 'email', 'profile']).join(' '));
  url.searchParams.set('prompt', options.prompt || 'consent');
  url.searchParams.set('access_type', 'online');
  if (options.state) {
    url.searchParams.set('state', options.state);
  }
  return url.toString();
}

/**
 * Trigger Google Contacts Authorization Popup.
 * Returns a UserCredential with the in-memory accessToken.
 */
export async function requestGoogleContactsAccess(
  provider?: GoogleAuthProvider
): Promise<UserCredential> {
  const activeProvider = provider || new GoogleAuthProvider();
  activeProvider.addScope(GOOGLE_CONTACTS_SCOPE);

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Browser environment required for popup authentication.'));
      return;
    }

    const width = 540;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popupUrl = '/api/auth/google/contacts';
    const popup = window.open(
      popupUrl,
      'google_contacts_oauth',
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );

    if (!popup) {
      reject(new Error('Popup blocked by browser. Please allow popups for this site.'));
      return;
    }

    let resolved = false;

    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'GOOGLE_CONTACTS_AUTH_SUCCESS') {
        resolved = true;
        window.removeEventListener('message', messageHandler);
        clearInterval(pollTimer);

        const accessToken = event.data.accessToken;
        const result: UserCredential = {
          user: null,
          providerId: GoogleAuthProvider.PROVIDER_ID,
          operationType: 'signIn',
          credential: {
            providerId: GoogleAuthProvider.PROVIDER_ID,
            signInMethod: GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD,
            accessToken,
          },
          accessToken,
        };
        resolve(result);
      } else if (event.data?.type === 'GOOGLE_CONTACTS_AUTH_ERROR') {
        resolved = true;
        window.removeEventListener('message', messageHandler);
        clearInterval(pollTimer);
        reject(new Error(event.data.error || 'Google Contacts permission was denied or cancelled.'));
      }
    };

    window.addEventListener('message', messageHandler);

    // Watch for user closing the popup manually
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        window.removeEventListener('message', messageHandler);
        if (!resolved) {
          reject(new Error('Google sign-in popup was closed before completing authorization.'));
        }
      }
    }, 600);
  });
}

