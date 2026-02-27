import { client as authClient } from '@/api/auth/client.gen';
import { client as ticketsClient } from '@/api/tickets/client.gen';

// Default configuration
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000';
const TICKETS_API_URL = import.meta.env.VITE_TICKETS_API_URL || 'http://localhost:3001';
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'default-tenant-id';

authClient.setConfig({
  baseUrl: AUTH_API_URL,
});

ticketsClient.setConfig({
  baseUrl: TICKETS_API_URL,
});

// Add tenant-id header to all requests
authClient.interceptors.request.use((req) => {
  req.headers.set('tenant-id', TENANT_ID);
  return req;
});

ticketsClient.interceptors.request.use((req) => {
  req.headers.set('tenant-id', TENANT_ID);
  return req;
});

export { authClient, ticketsClient, TENANT_ID };
