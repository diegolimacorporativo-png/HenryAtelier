---
name: Supabase preview configuration
description: Replit preview behavior for Supabase client configuration and safe fallback handling.
---

The storefront's Supabase client must validate `VITE_SUPABASE_URL` before constructing the client. In this environment, a secret can exist but still arrive in the preview runtime as an unusable value, so a known public project URL fallback prevents the entire React shell from crashing.

**Why:** An invalid Supabase URL caused the preview to abort before rendering, and a secret Supabase API key triggered a browser security block. The URL and anon/publishable key are browser-facing configuration; service-role or `sb_secret` keys must never be used there.

**How to apply:** Keep URL validation and fallback logic in the client initialization. Use a publishable/anon key in the Vite client, rotate any service-role or `sb_secret` key that was exposed, and never print or commit secrets or passwords.