---
name: Supabase preview configuration
description: Replit preview behavior for Supabase client configuration and safe fallback handling.
---

The storefront's Supabase client must validate `VITE_SUPABASE_URL` before constructing the client. In this environment, a secret can exist but still arrive in the preview runtime as an unusable value, so a known public project URL fallback prevents the entire React shell from crashing.

**Why:** An invalid Supabase URL caused the preview to abort before rendering and also prevented admin authentication from being tested. The URL is public configuration; the anon/publishable key must remain in secure environment configuration.

**How to apply:** Keep URL validation and fallback logic in the client initialization. Never print or commit Supabase keys, passwords, service-role credentials, or other secret values.