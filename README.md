# The Household Brothers — Website Rebuild

A mobile-responsive rebuild of [thehouseholdbrothers.com](https://www.thehouseholdbrothers.com/home/), a social club site for Nigerian gentlemen in South Africa.

Static HTML/CSS/JS — no build step. Deployed on Vercel.

## Structure
- `index.html` — page markup (hero, gallery, about, team, benefits, join, popups)
- `styles.css` — responsive styling (mobile-first breakpoints at 980px / 860px / 640px / 400px)
- `script.js` — mobile nav toggle, scroll-spy nav highlighting, gallery marquee (drift, scroll speed-up, hover pause, drag/swipe), membership popups, gallery lightbox
- `images/` — logo, team headshots, gallery photos

## Adding gallery photos
1. Save the photo as a square-ish JPG around 1080px wide (under ~350 KB) in `images/gallery/`.
2. Add one line to either `.marquee-track` in the `#gallery` section of `index.html`:
   `<div class="photo-cell"><img src="images/gallery/NEW.jpg" alt="" loading="lazy" decoding="async" width="1080" height="1080"></div>`
3. List each photo once. `script.js` creates the copies needed for the seamless loop, and the lightbox picks up new photos automatically.

## Local preview
Just open `index.html` in a browser, or serve it:

```bash
npx serve .
```
