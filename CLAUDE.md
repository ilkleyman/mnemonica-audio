# Mnemonica Audio — Project Notes

## What this app is
A PWA flashcard app for learning the Mnemonica card stack using voice recordings. Hosted on GitHub Pages at https://ilkleyman.github.io/mnemonica-audio/.

## Key files
- `/Users/paulsmithson/Developer/mnemonica-audio/index.html` — all app logic, styles, and hardcoded JSONBin credentials
- `/Users/paulsmithson/Developer/mnemonica-audio/sw.js` — service worker; bump the cache version (e.g. mnemonica-v17) on every deploy

## Deploying
1. Edit index.html and/or sw.js
2. Bump the cache version in sw.js
3. Commit and push via SSH — the remote is already set to git@github.com:ilkleyman/mnemonica-audio.git
4. GitHub Pages deploys automatically from the main branch

## Features
- Timed and auto modes
- Worst-cards drill
- Per-card reaction time tracking
- Ranking system
- Scores page
- Data syncs via JSONBin (credentials hardcoded in index.html)
