import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
/**
 * BASE44 SDK PRODUCTION PATCH
 * Fixes internal 404s for public-settings on GitHub Pages
 */
const BASE44_SERVER = "https://vrtiq.base44.app";

// 1. Intercept Fetch requests
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  // If the SDK tries to call a root-relative /api path
  if (typeof resource === 'string' && resource.startsWith('/api/')) {
    resource = `${BASE44_SERVER}${resource}`;
  }
  return originalFetch(resource, config);
};

// 2. Intercept XMLHttpRequest (Required if the SDK uses older XHR)
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string' && url.startsWith('/api/')) {
    url = `${BASE44_SERVER}${url}`;
  }
  return originalOpen.apply(this, [method, url, ...rest]);
};
//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: 'https://vrtiq.base44.app',
  requiresAuth: false,
  appBaseUrl: 'https://vrtiq.base44.app'
});
