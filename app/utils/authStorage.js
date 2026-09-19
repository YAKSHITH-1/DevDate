export const ACCESS_TOKEN_KEY = 'devdate_access_token';
export const REFRESH_TOKEN_KEY = 'devdate_refresh_token';

// In-memory fallback for environments without SecureStore or localStorage
const memoryStore = {
  [ACCESS_TOKEN_KEY]: null,
  [REFRESH_TOKEN_KEY]: null,
};

let SecureStoreModule = null;
let PlatformModule = null;

async function getSecureStore() {
  if (SecureStoreModule !== null) return SecureStoreModule;
  try {
    if (typeof require !== 'undefined') {
      SecureStoreModule = require('expo-secure-store');
      return SecureStoreModule;
    }
  } catch {
    // Continue to dynamic import
  }
  try {
    SecureStoreModule = await import('expo-secure-store');
    return SecureStoreModule;
  } catch {
    SecureStoreModule = false;
    return false;
  }
}

async function getPlatform() {
  if (PlatformModule !== null) return PlatformModule;
  try {
    if (typeof require !== 'undefined') {
      const rn = require('react-native');
      PlatformModule = rn.Platform || rn.default?.Platform || false;
      return PlatformModule;
    }
  } catch {
    // Continue to dynamic import
  }
  try {
    const rn = await import('react-native');
    PlatformModule = rn.Platform || rn.default?.Platform || false;
    return PlatformModule;
  } catch {
    PlatformModule = false;
    return false;
  }
}

/**
 * Checks if SecureStore is supported in the current runtime environment.
 */
async function canUseSecureStore() {
  try {
    const platform = await getPlatform();
    if (platform && platform.OS === 'web') {
      return false;
    }
    const store = await getSecureStore();
    if (!store) return false;
    if (typeof store.isAvailableAsync === 'function') {
      return await store.isAvailableAsync();
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Gets localStorage if running in a web browser environment.
 */
function getWebStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Securely saves access and refresh tokens.
 * @param {string} accessToken
 * @param {string} refreshToken
 * @returns {Promise<{ success: boolean }>}
 */
export async function saveAuthTokens(accessToken, refreshToken) {
  try {
    const isSecure = await canUseSecureStore();
    const secureStore = isSecure ? await getSecureStore() : null;
    const webStorage = getWebStorage();

    if (accessToken) {
      if (isSecure && secureStore) {
        await secureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      } else if (webStorage) {
        webStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      } else {
        memoryStore[ACCESS_TOKEN_KEY] = accessToken;
      }
    }

    if (refreshToken) {
      if (isSecure && secureStore) {
        await secureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      } else if (webStorage) {
        webStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        memoryStore[REFRESH_TOKEN_KEY] = refreshToken;
      }
    }

    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Reads stored access and refresh tokens.
 * @returns {Promise<{ accessToken: string | null, refreshToken: string | null }>}
 */
export async function getAuthTokens() {
  try {
    const isSecure = await canUseSecureStore();
    const secureStore = isSecure ? await getSecureStore() : null;
    const webStorage = getWebStorage();

    let accessToken = null;
    let refreshToken = null;

    if (isSecure && secureStore) {
      accessToken = await secureStore.getItemAsync(ACCESS_TOKEN_KEY);
      refreshToken = await secureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } else if (webStorage) {
      accessToken = webStorage.getItem(ACCESS_TOKEN_KEY);
      refreshToken = webStorage.getItem(REFRESH_TOKEN_KEY);
    } else {
      accessToken = memoryStore[ACCESS_TOKEN_KEY];
      refreshToken = memoryStore[REFRESH_TOKEN_KEY];
    }

    return {
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
    };
  }
}

/**
 * Clears stored access and refresh tokens.
 * @returns {Promise<{ success: boolean }>}
 */
export async function clearAuthTokens() {
  try {
    const isSecure = await canUseSecureStore();
    const secureStore = isSecure ? await getSecureStore() : null;
    const webStorage = getWebStorage();

    if (isSecure && secureStore) {
      await secureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await secureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } else if (webStorage) {
      webStorage.removeItem(ACCESS_TOKEN_KEY);
      webStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    memoryStore[ACCESS_TOKEN_KEY] = null;
    memoryStore[REFRESH_TOKEN_KEY] = null;

    return { success: true };
  } catch {
    memoryStore[ACCESS_TOKEN_KEY] = null;
    memoryStore[REFRESH_TOKEN_KEY] = null;
    return { success: false };
  }
}

export default {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  saveAuthTokens,
  getAuthTokens,
  clearAuthTokens,
};
