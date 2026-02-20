import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  onIdTokenChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

// Re-export the auth instance so other modules can subscribe directly.
export { auth };

let inMemoryToken = null;
let tokenExpiryMs = 0;
let tokenRefreshPromise = null;

function clearTokenCache() {
  inMemoryToken = null;
  tokenExpiryMs = 0;
}

async function cacheCurrentUserToken(forceRefresh = false) {
  if (!auth.currentUser) {
    clearTokenCache();
    return null;
  }

  const [token, tokenResult] = await Promise.all([
    auth.currentUser.getIdToken(forceRefresh),
    auth.currentUser.getIdTokenResult(forceRefresh)
  ]);

  const expiryMs = Date.parse(tokenResult?.expirationTime || '');
  inMemoryToken = token;
  tokenExpiryMs = Number.isFinite(expiryMs) ? expiryMs : Date.now() + 50 * 60 * 1000;
  return token;
}

function isTokenNearExpiry() {
  if (!inMemoryToken || !tokenExpiryMs) return true;
  return Date.now() >= tokenExpiryMs - 60_000;
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await cacheCurrentUserToken(true);
  return result.user;
}

export async function signOut() {
  clearTokenCache();
  await firebaseSignOut(auth);
}

// Get a valid ID token from memory cache and silently refresh if needed.
export async function getFreshIdToken(forceRefresh = false) {
  if (!auth.currentUser) return null;

  if (!forceRefresh && inMemoryToken && !isTokenNearExpiry()) {
    return inMemoryToken;
  }

  if (!tokenRefreshPromise) {
    tokenRefreshPromise = cacheCurrentUserToken(forceRefresh).finally(() => {
      tokenRefreshPromise = null;
    });
  }

  return tokenRefreshPromise;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Subscribe to ID token changes (captures refreshes as well as sign-in/out).
export function onIdTokenChange(callback) {
  return onIdTokenChanged(auth, callback);
}

// Keep in-memory token cache synchronized with Firebase auth state.
export function initAuthTokenSync() {
  return onIdTokenChanged(auth, async (user) => {
    if (!user) {
      clearTokenCache();
      return;
    }
    try {
      await cacheCurrentUserToken(false);
    } catch {
      clearTokenCache();
    }
  });
}

// Backward compatibility helper (non-forced)
export function getToken() {
  return getFreshIdToken(false);
}
