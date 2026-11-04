# The Household Brothers — Website Rebuild

A mobile-responsive rebuild of [thehouseholdbrothers.com](https://www.thehouseholdbrothers.com/home/), a social club site for Nigerian gentlemen in South Africa.

Static HTML/CSS/JS — no build step. Deployed on Vercel.

## Structure
- `index.html` — page markup (hero, gallery, about, team, benefits, join, popups)
- `styles.css` — responsive styling (mobile-first breakpoints at 980px / 860px / 640px / 400px)
- `script.js` — mobile nav toggle, scroll-spy nav highlighting, gallery marquee (drift, scroll speed-up, hover pause, drag/swipe), membership popups, gallery lightbox
- `images/` — logo, team headshots, gallery photos (`gallery/thumbs/` holds the small strip versions)

## Adding gallery photos
Each photo needs two files, both with location data stripped:
1. **Full size** (opened in the lightbox): `images/gallery/gNN.jpg`, longest side 1600px, JPEG quality ~80 (usually 200-400 KB).
2. **Thumbnails** (shown in the scrolling strip): a square crop saved twice as WebP quality ~76: `images/gallery/thumbs/gNN.webp` at 520x520 (about 50 KB) and `images/gallery/thumbs/gNN-320.webp` at 320x320 (about 20 KB, used on phones).

Then add one line to either `.marquee-track` in the `#gallery` section of `index.html`:

```html
<div class="photo-cell" data-full="images/gallery/gNN.jpg"><img src="images/gallery/thumbs/gNN.webp" srcset="images/gallery/thumbs/gNN-320.webp 320w, images/gallery/thumbs/gNN.webp 520w" sizes="(max-width: 560px) 150px, (max-width: 992px) 200px, 260px" alt="" loading="lazy" decoding="async" width="520" height="520"></div>
```

List each photo once. `script.js` creates the copies needed for the seamless loop, and the lightbox picks up new photos automatically. Never upload phone originals (4-20 MB) directly.

## Caching
`vercel.json` caches images for 7 days and fonts for a year. If you replace an image, give it a new file name so visitors don't keep the old one.

## Local preview
Just open `index.html` in a browser, or serve it:

```bash
npx serve .
```
