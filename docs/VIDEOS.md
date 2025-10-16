# Optimizing Video for Cloudflare Pages

A practical, copy‑pasteable guide to encode a UI/screencast video, serve it efficiently from Cloudflare Pages, and generate a seamless first‑frame poster.

***

## TL;DR (Good Defaults)

**Encode MP4 (H.264) for widest support**

```bash
ffmpeg -i input.mov \
  -vf "fps=24,scale=1280:-1,format=yuv420p" \
  -an -c:v libx264 -preset veryslow -tune stillimage -crf 28 \
  -movflags +faststart \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  output/ui-demo_1280w24f_v1.mp4
```

**Optional: Smaller alternate using WebM/VP9 with deringing**

```bash
ffmpeg -y -i input.mov \
  -vf "fps=24,scale=1280:-1,format=yuv420p" -an \
  -c:v libvpx-vp9 -crf 38 -b:v 0 -pass 1 \
  -speed 4 -row-mt 1 -tile-columns 2 \
  -g 48 -lag-in-frames 25 -auto-alt-ref 1 \
  -arnr-maxframes 7 -arnr-strength 4 -arnr-type 3 \
  -f webm /dev/null

ffmpeg -i input.mov \
  -vf "fps=24,scale=1280:-1,format=yuv420p" -an \
  -c:v libvpx-vp9 -crf 38 -b:v 0 -pass 2 \
  -speed 1 -row-mt 1 -tile-columns 2 \
  -g 48 -lag-in-frames 25 -auto-alt-ref 1 \
  -arnr-maxframes 7 -arnr-strength 4 -arnr-type 3 \
  output/ui-demo_1280w24f_v1.webm
```

**Poster from the exact first frame of the *final* MP4**

```bash
ffmpeg -i output/ui-demo_1280w24f_v1.mp4 \
  -vf "select=eq(n\,0),scale=1280:-1:flags=lanczos" \
  -vsync 0 -frames:v 1 -map_metadata -1 poster_raw.png
```

**Compress poster (choose one or more):**\
*AVIF (smallest):*

```bash
avifenc poster_raw.png poster/ui-demo_1280w24f_v1.avif \
  --min 24 --max 32 --cq-level 28 --speed 6 --jobs 8 --chroma-subsample 420
```

*WebP:*

```bash
cwebp -q 62 -m 6 -af -mt poster_raw.png -o poster/ui-demo_1280w24f_v1.webp
```

*Progressive JPEG (fallback):*

```bash
cjpeg -quality 74 -progressive -optimize -sample 2x2 \
  -outfile poster/ui-demo_1280w24f_v1.jpg poster_raw.png
```

**Cloudflare Pages `_headers`**

The `_headers` file must be placed in the `public/` directory since that's configured as the `assets.directory` in `wrangler.jsonc`. Cloudflare Pages will read this file from the deployment root.

All media assets (videos, posters, and images) are stored in the `/images/` directory.

```
/images/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Timing-Allow-Origin: *
```

**HTML**

```html
<video
  src="/videos/ui-demo_1280w24f_v1.mp4"
  poster="/poster/ui-demo_1280w24f_v1.avif"
  playsinline muted loop autoplay preload="metadata"
  width="1280" style="max-width:100%;height:auto">
  <!-- Optional alternate: -->
  <source src="/videos/ui-demo_1280w24f_v1.webm" type="video/webm">
  <source src="/videos/ui-demo_1280w24f_v1.mp4"  type="video/mp4">
</video>
```

***

## Why These Settings (UI/Screencast Rationale)

* **24 fps** is plenty for cursor/UI motion; consider 20 fps for smaller files.
* **`-tune stillimage`** favors flat colors/text and long static regions common in UI demos.
* **`format=yuv420p`** guarantees browser compatibility (QuickTime often captures 4:4:4/4:2:2).
* **`-movflags +faststart`** places metadata up front for instant streaming + seeking.
* **Color tags (`bt709`)** keep colors consistent across players.
* **WebM/VP9 `-crf 38` + deringing** often beats H.264 size on static UI; raise to `40–42` to shrink further.

***

## Two-Pass H.264 (when you need a strict bitrate target)

If your CDN/design requires a target average bitrate (e.g., 1500–2000 kbps):

```bash
# Pass 1
ffmpeg -y -i input.mov \
  -vf "fps=24,scale=1280:-1,format=yuv420p" \
  -an -c:v libx264 -b:v 1500k -pass 1 -preset veryslow -tune stillimage \
  -x264opts keyint=48:min-keyint=48:no-scenecut \
  -movflags +faststart -f mp4 /dev/null

# Pass 2
ffmpeg -i input.mov \
  -vf "fps=24,scale=1280:-1,format=yuv420p" \
  -an -c:v libx264 -b:v 1500k -pass 2 -preset veryslow -tune stillimage \
  -x264opts keyint=48:min-keyint=48:no-scenecut \
  -movflags +faststart output/ui-demo_1280w24f_v1.mp4
```

**Notes:**

* `keyint=48` ≈ 2s keyframes at 24 fps for smooth seeking/looping.
* Bump `-b:v` to `2000k` for crisper text; drop to `1200k` for smaller files.

***

## Single-Pass H.264 (CRF—often best for UI)

If you don’t need a specific bitrate and want best quality per byte:

```bash
ffmpeg -i input.mov \
  -vf "fps=24,scale=1280:-1,format=yuv420p" \
  -an -c:v libx264 -preset veryslow -tune stillimage -crf 26 \
  -movflags +faststart \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  output/ui-demo_1280w24f_v1.mp4
```

* Lower `-crf` → higher quality (and bigger). Try `24` if tiny UI text needs more fidelity; `28` for smaller files.

***

## WebM/VP9 (with deringing) — dial size below MP4

Start at CRF 38, then raise to 40–42 if you must beat a particular MP4 size.

```bash
# Pass 1
ffmpeg -y -i input.mov \
  -vf "fps=24,scale=1280:-1,format=yuv420p" -an \
  -c:v libvpx-vp9 -crf 38 -b:v 0 -pass 1 \
  -speed 4 -row-mt 1 -tile-columns 2 \
  -g 48 -lag-in-frames 25 -auto-alt-ref 1 \
  -arnr-maxframes 7 -arnr-strength 4 -arnr-type 3 \
  -f webm /dev/null

# Pass 2
ffmpeg -i input.mov \
  -vf "fps=24,scale=1280:-1,format=yuv420p" -an \
  -c:v libvpx-vp9 -crf 38 -b:v 0 -pass 2 \
  -speed 1 -row-mt 1 -tile-columns 2 \
  -g 48 -lag-in-frames 25 -auto-alt-ref 1 \
  -arnr-maxframes 7 -arnr-strength 4 -arnr-type 3 \
  output/ui-demo_1280w24f_v1.webm
```

**Variants:**

* **20 fps** version (often fine for cursor‑heavy UI; set keyframes to ~2s):\
  change `fps=24` → `fps=20` and `-g 48` → `-g 40`.
* If you see banding but want to keep size: add `-aq-mode 1` (slight size increase, crisper gradients).

***

## Poster: Seamless First‑Frame Thumbnail

Extract **frame 0** from the **final delivery file** to avoid a poster→first‑frame jump.

```bash
# From MP4 (or run against your WebM if that’s your primary source)
ffmpeg -i output/ui-demo_1280w24f_v1.mp4 \
  -vf "select=eq(n\,0),scale=1280:-1:flags=lanczos" \
  -vsync 0 -frames:v 1 -map_metadata -1 poster_raw.png
```

**Compress the poster:**

*AVIF (preferred)*

```bash
avifenc poster_raw.png poster/ui-demo_1280w24f_v1.avif \
  --min 24 --max 32 --cq-level 28 --speed 6 --jobs 8 --chroma-subsample 420
```

*WebP*

```bash
cwebp -q 62 -m 6 -af -mt poster_raw.png -o poster/ui-demo_1280w24f_v1.webp
```

*Progressive JPEG*

```bash
cjpeg -quality 74 -progressive -optimize -sample 2x2 \
  -outfile poster/ui-demo_1280w24f_v1.jpg poster_raw.png
```

**Targets to aim for:** 20–80 KB at 1280‑wide for UI. If bigger, raise AVIF `--cq-level` or lower WebP `-q` slightly.

***

## Cloudflare Pages Setup

**`_headers` file in the `public/` directory (deployment root):**

The `_headers` file must be placed in the `public/` directory since that's configured as the `assets.directory` in `wrangler.jsonc`. Cloudflare Pages will read this file from the deployment root.

All media assets (videos, posters, and images) are stored in the `/images/` directory.

```
/images/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Timing-Allow-Origin: *
```

**File naming/versioning:** Include a version suffix (e.g., `_v1`). When you update the file, bump the version to bust the `immutable` cache.

***

## HTML Patterns

**Straight autoplay hero (polite preload):**

```html
<video
  src="/videos/ui-demo_1280w24f_v1.mp4"
  poster="/poster/ui-demo_1280w24f_v1.avif"
  playsinline muted loop autoplay preload="metadata"
  width="1280" style="max-width:100%;height:auto">
  <source src="/videos/ui-demo_1280w24f_v1.webm" type="video/webm">
  <source src="/videos/ui-demo_1280w24f_v1.mp4"  type="video/mp4">
</video>
```

**Lazy‑init when near viewport (avoid bandwidth before visible):**

```html
<video id="demo" poster="/poster/ui-demo_1280w24f_v1.avif"
       playsinline muted loop preload="none"
       width="1280" style="max-width:100%;height:auto"></video>
<script>
  const v = document.getElementById('demo');
  const srcs = [
    {src: '/videos/ui-demo_1280w24f_v1.webm', type: 'video/webm'},
    {src: '/videos/ui-demo_1280w24f_v1.mp4',  type: 'video/mp4'}
  ];
  let started = false;
  const io = new IntersectionObserver(entries => {
    if (!started && entries.some(e => e.isIntersecting)) {
      started = true;
      for (const s of srcs) {
        const el = document.createElement('source');
        el.src = s.src; el.type = s.type;
        v.appendChild(el);
      }
      v.load();
      v.play().catch(()=>{});
      io.disconnect();
    }
  }, { rootMargin: '300px' });
  io.observe(v);
</script>
```

***

## Troubleshooting & Tips

* **MOV input quirks:** QuickTime often uses 4:4:4/4:2:2 and variable FPS; normalize with `format=yuv420p` and `fps=24` in your `-vf` chain.
* **Text looks soft:** lower CRF (e.g., 26 → 24) or raise bitrate (2‑pass) a bit; keep `-preset veryslow` if time allows.
* **Seeking feels sluggish:** ensure consistent keyframes (`-x264opts keyint=48:min-keyint=48:no-scenecut` for H.264, `-g 48` for VP9).
* **Make it even smaller:** drop to **20 fps** for cursor‑heavy videos; try VP9 `-crf 40–42`.
* **Accessibility:** if decorative, add `aria-hidden="true"` and `tabindex="-1"`. If informative, provide captions/alt content.
* **Headers already include range support:** Cloudflare serves `Accept-Ranges: bytes`; no special streaming config needed.

***

## Size Benchmarks (rules of thumb)

* **MP4/H.264 (1280w/24 fps, UI demo):** ~2.5–5.5 MB at `-crf 26–28`
* **WebM/VP9 (same):** often **20–35% smaller** than MP4 at `-crf 38–42`
* **Poster:** 20–80 KB (AVIF typically 15–40 KB at 1280w)

***

*Version:* v1.0 — tailored for UI/screencast videos served from Cloudflare Pages.
