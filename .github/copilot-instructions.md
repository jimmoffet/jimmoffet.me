# Copilot Instructions for jimmoffet.me

## Project Overview

This is a personal portfolio website for Jim Moffet, built as a static single-page site with interactive text animations and dynamic background colors.

## Architecture

**Static HTML site** with no build process—directly deployable to any static host (designed for Cloudflare Pages).

**Core files:**

- `index.html` - Single-page portfolio with all content
- `js/personal.js` - Animation engine (typewriter effect, color loop)
- `css/main.css` - All styles including responsive design
- `css/normalize.css` - CSS reset
- `fonts/` - Circular Std font family (Bold & Book weights)
- `images/` - Optimized media (AVIF, WebP, MP4, favicon)

## Key Patterns & Conventions

### Dynamic Color System

The site features a procedural color scheme that changes every 20 seconds:

**Current implementation** (JavaScript-based):

```javascript
// personal.js lines 166-185
var h = rand(1, 360);
var s = rand(70, 80);
var l = rand(20, 30);
body.css({ background: "hsl(" + h + "," + s + "%," + l + "%)" });
```

**TODO (from TODO.md):** Migrate to CSS custom properties:

```javascript
document.documentElement.style.setProperty(
  "--bg-color",
  `hsl(${h}, ${s}%, ${l}%)`
);
```

When editing color-related code, prefer setting CSS variables over direct jQuery `.css()` calls.

### Typewriter Animation

The homepage features a rotating typewriter effect defined in `personal.js`:

- Array of 40+ sentence fragments in `sections` variable (lines 25-65)
- Types out "Jim Moffet is [rotating phrase]"
- Character-by-character animation with backspace effect
- Triggers `.afterTyping` section visibility after first phrase completes

**To add new phrases:** append to the `sections` array following the `{ sentence: "..." }` pattern.

### Video Optimization Strategy

The site uses highly-optimized videos per the comprehensive guide in `VIDEOS.md`:

**Standard workflow** (from VIDEOS.md):

1. Encode MP4 with H.264 using `fps=24`, `scale=1280:-1`, `-crf 28`, `-tune stillimage`
2. Optional WebM/VP9 alternate at `-crf 38` with deringing for 20-35% smaller files
3. Extract first frame as poster in AVIF/WebP/JPEG formats
4. Version files with `_v1`, `_v2` suffixes for cache busting

**HTML pattern in use** (`index.html` lines 315-330):

```html
<div class="stack" id="player">
  <video id="vid" src="/images/gsai_v1.mp4" playsinline muted loop autoplay preload="metadata" width="1280">
  <picture class="poster">
    <source srcset="/images/gsai_poster.avif" type="image/avif" />
    <source srcset="/images/gsai_poster.webp" type="image/webp" />
    <img src="/images/gsai_poster.webp" />
  </picture>
</div>
```

**The `.stack` pattern** (main.css lines 309-327):

- Parent container with `position: relative`
- Poster image absolutely positioned behind video (`z-index: 0`)
- Video layered on top (`z-index: 1`)
- Both use `width: 100%` for responsive sizing

### Image Optimization

All raster images follow the "modern formats + fallback" pattern:

- AVIF first (smallest, best quality)
- WebP second (good browser support)
- GIF/JPEG fallback (universal support)

See `index.html` lines 268-273 for the `<picture>` implementation.

## Developer Workflows

### No Build Process

This is a **deploy-as-is** static site. No transpilation, bundling, or preprocessing.

**To develop:**

1. Edit files directly
2. Open `index.html` in browser (or use `python -m http.server 8000`)
3. Refresh to see changes

**To deploy:**

- Push to main branch (if connected to Cloudflare Pages)
- Or copy entire directory to any static host

### Adding New "Selected Works" Entries

Each work is a `<li>` in the `.featuresList` (index.html lines 247-384):

```html
<li>
  <div class="featureTitle">Project Name</div>
  <div class="info">
    Date, Location <br /><br />
    <div class="infoImgContainer">
      <div class="infoImgBackground"></div>
      <div class="infoImgForeground">
        <picture><!-- optimized image --></picture>
      </div>
    </div>
    Description text...
  </div>
</li>
```

**Color coupling:** The `.infoImgBackground` border/background color is set dynamically by `changebackground()` in personal.js to match the site's current complementary color.

## External Dependencies

**jQuery 3.7.1** (CDN): Used for DOM manipulation and color transitions. Loaded from cdnjs with SRI integrity check.

**No other runtime dependencies.** The site includes commented-out references to:

- GSAP/TweenMax (hover animations prototype, lines 290-427 in personal.js)
- Particles.js background (commented out)

These were removed but hover effect code remains for potential restoration.

## Browser Compatibility Notes

**Firefox-specific fix** (personal.js line 356):

```javascript
if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
  $("body").addClass("firefoxFix");
}
```

CSS handles Firefox rendering differences via `.firefoxFix` class.

## File Naming Conventions

- **Media files:** Use descriptive names with version suffixes: `gsai_v1.mp4`, `usai.avif`
- **Font files:** Format: `circularstd-{weight}.{ext}`
- **No spaces or special characters** in filenames (URL-safe naming)

## Common Tasks

**Update background color timing:**

```javascript
// personal.js line 367 - initial delay
setTimeout(..., 2000);
// personal.js line 370 - interval between changes
setInterval(changebackground, 20000); // 20 seconds
```

**Modify responsive breakpoints:** Check `main.css` - uses viewport units (`vw`, `vh`) extensively instead of pixel breakpoints.

**Add new fonts:** Add `@font-face` declarations in `main.css` (lines 1-21) and place files in `fonts/` directory.
