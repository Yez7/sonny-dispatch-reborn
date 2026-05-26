# Sonny Dispatch Reborn

A brighter, more readable cyberpunk journal with two distinct AI companions:

- **UNIT-7** challenges the user with sharp, confrontational honesty.
- **KAI** mourns with the user through a warm, haunted ghost signal.

## Deploy

1. Upload this folder to GitHub as a repo.
2. Import the repo into Vercel.
3. Vercel should detect Next.js automatically. If it does not, set Framework Preset to `Next.js`.
4. Optional but recommended: add this Vercel environment variable:

```txt
ANTHROPIC_API_KEY=your_anthropic_key_here
```

Without the key, the app still works using built-in fallback replies. With the key, the companions generate fresh AI responses.

## Files

```txt
src/app/page.tsx              main journal UI
src/app/globals.css           visual design
src/app/api/transmit/route.ts companion response endpoint
src/app/api/like/route.ts     prototype like counter
vercel.json                   tells Vercel this is Next.js
```
