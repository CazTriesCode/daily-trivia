# Daily Trivia (Lightweight)
A single-file HTML app that shows **one trivia question per day**, rotates through your themes (Animals, Gaming, Marvel, Lord of the Rings, Cars), tracks a streak in `localStorage`, and generates multiple-choice options automatically from the same category.

## How to use
1. Download and unzip.
2. Open `index.html` in a browser. That’s it.
3. To deploy, drop it on Netlify / Vercel / GitHub Pages.

## Customize
- Change `SALT` in the script to reshuffle the deterministic daily order.
- Edit `CATEGORY_ORDER`, `CATEGORY_COLORS`, or the question bank `BANK` embedded in the page.
- Replace the background gradients and typography to match your Figma design.

## Firebase (optional)
Uncomment the Firebase section in the script, paste your project config, add the 3 Firebase compat script tags, and you’ll be able to log answers across devices.
