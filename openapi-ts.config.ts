import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: [
    'https://hype.byal.org/tickets/docs-json',
    'https://hype.byal.org/auth/docs-json',
    'https://hype.byal.org/payment/docs-json',
  ],
  output: ['src/_gen/api/tickets', 'src/_gen/api/auth', 'src/_gen/api/payment'],
  plugins: ['@hey-api/client-fetch'],
});
