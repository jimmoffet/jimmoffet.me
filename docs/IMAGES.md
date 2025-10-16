# Optimizing Images for Cloudflare Pages

A practical, copy‑pasteable guide to optimize images for web delivery, serve them efficiently from Cloudflare Pages, and implement modern responsive image patterns.

***

## TL;DR (Good Defaults)

**Raster Images (Photos/UI Screenshots)**

```bash
# AVIF (smallest, best quality)
avifenc input.png output/image-name.avif \
  --min 20 --max 32 --cq-level 26 --speed 6 --jobs 8 --chroma-subsample 420

# WebP (good fallback)
cwebp -q 80 -m 6 -af -mt input.png -o output/image-name.webp

# Progressive JPEG (universal fallback)
cjpeg -quality 80 -progressive -optimize -sample 2x2 \
  -outfile output/image-name.jpg input.png
```

**Responsive Sizing**

```bash
# Generate multiple sizes for responsive images
for width in 320 640 960 1280 1920; do
  convert input.png -resize ${width}x -quality 85 output/image-${width}w.jpg
done
```

**HTML Pattern**

```html
<picture>
  <source srcset="/images/hero.avif" type="image/avif" />
  <source srcset="/images/hero.webp" type="image/webp" />
  <img src="/images/hero.jpg" alt="Description" width="1280" height="720" />
</picture>
```

***

## Image Format Decision Tree

### When to use AVIF

* **Best for:** Photos, gradients, complex graphics
* **File size:** ~30-50% smaller than WebP, ~50-70% smaller than JPEG
* **Browser support:** Chrome 85+, Firefox 93+, Safari 16.1+ (2022+)
* **Use as:** Primary source in `<picture>` with WebP/JPEG fallbacks

### When to use WebP

* **Best for:** All raster images when AVIF isn't supported
* **File size:** ~25-35% smaller than JPEG/PNG at similar quality
* **Browser support:** 96%+ (all modern browsers since 2020)
* **Use as:** Secondary fallback after AVIF

### When to use JPEG

* **Best for:** Universal fallback for photos
* **File size:** Standard baseline
* **Browser support:** 100% (universal)
* **Use as:** Final fallback in `<picture>` or `<img src>`

### When to use PNG

* **Best for:** Simple graphics with transparency, logos, icons (but consider SVG first)
* **File size:** Larger than AVIF/WebP for photos; good for simple graphics
* **Browser support:** 100% (universal)
* **Use as:** Source for conversion, or final output for transparency needs

### When to use SVG

* **Best for:** Logos, icons, illustrations, line art, anything that's vector-based
* **File size:** Typically smallest for simple graphics, scales infinitely
* **Browser support:** 100% (universal)
* **Use as:** Primary format for any vector content

### When to use GIF

* **Best for:** Simple animations (but consider video/WebP animation)
* **File size:** Large, limited colors (256)
* **Browser support:** 100% (universal)
* **Use as:** Legacy animations (consider converting to video for loops)

***

## Photo Optimization Workflow

### Step 1: Prepare Source Image

**Resize to target maximum width:**

```bash
# For hero images (full-width)
convert input.jpg -resize 1920x -quality 100 source.png

# For content images (narrower)
convert input.jpg -resize 1280x -quality 100 source.png
```

**Optional: Strip metadata to reduce file size:**

```bash
exiftool -all= -overwrite_original source.png
# or with ImageMagick
convert source.png -strip source-clean.png
```

### Step 2: Generate AVIF (Smallest)

```bash
avifenc source.png output/photo-1280w.avif \
  --min 20 --max 32 --cq-level 26 --speed 6 --jobs 8 --chroma-subsample 420
```

**Quality tuning:**

* Lower `--cq-level` (18-24) = higher quality, larger file
* Higher `--cq-level` (28-32) = lower quality, smaller file
* `--cq-level 26` is a good balance for photos

**For UI screenshots/text-heavy images:**

```bash
avifenc source.png output/screenshot-1280w.avif \
  --min 24 --max 32 --cq-level 28 --speed 6 --jobs 8 --chroma-subsample 444
```

Note: `--chroma-subsample 444` preserves more color detail for text.

### Step 3: Generate WebP (Fallback)

```bash
cwebp -q 80 -m 6 -af -mt source.png -o output/photo-1280w.webp
```

**Quality tuning:**

* `-q 75-85` for photos (80 is a good default)
* `-q 85-95` for screenshots/UI with text
* `-m 6` uses slowest compression (best quality/size ratio)
* `-af` enables auto-filter for sharper images

**For transparency (PNG replacement):**

```bash
cwebp -q 90 -m 6 -mt source.png -o output/graphic-1280w.webp
```

### Step 4: Generate JPEG (Universal Fallback)

```bash
cjpeg -quality 80 -progressive -optimize -sample 2x2 \
  -outfile output/photo-1280w.jpg source.png
```

**Quality tuning:**

* `-quality 75-85` for photos
* `-quality 85-90` for screenshots/UI
* `-progressive` enables progressive loading
* `-optimize` runs optimization pass
* `-sample 2x2` uses 4:2:0 chroma subsampling (standard)

***

## Responsive Images (Multiple Sizes)

### Generate Multiple Widths

```bash
# Common breakpoints: 320w, 640w, 960w, 1280w, 1920w
for width in 320 640 960 1280 1920; do
  # Resize source
  convert source.png -resize ${width}x -quality 100 temp-${width}w.png
  
  # Generate AVIF
  avifenc temp-${width}w.png output/photo-${width}w.avif \
    --min 20 --max 32 --cq-level 26 --speed 6 --jobs 8 --chroma-subsample 420
  
  # Generate WebP
  cwebp -q 80 -m 6 -af -mt temp-${width}w.png -o output/photo-${width}w.webp
  
  # Generate JPEG
  cjpeg -quality 80 -progressive -optimize -sample 2x2 \
    -outfile output/photo-${width}w.jpg temp-${width}w.png
  
  # Clean up temp file
  rm temp-${width}w.png
done
```

### Responsive HTML Pattern

```html
<picture>
  <source
    type="image/avif"
    srcset="
      /images/photo-320w.avif   320w,
      /images/photo-640w.avif   640w,
      /images/photo-960w.avif   960w,
      /images/photo-1280w.avif 1280w,
      /images/photo-1920w.avif 1920w
    "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1280px"
  />
  <source
    type="image/webp"
    srcset="
      /images/photo-320w.webp   320w,
      /images/photo-640w.webp   640w,
      /images/photo-960w.webp   960w,
      /images/photo-1280w.webp 1280w,
      /images/photo-1920w.webp 1920w
    "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1280px"
  />
  <img
    src="/images/photo-1280w.jpg"
    srcset="
      /images/photo-320w.jpg   320w,
      /images/photo-640w.jpg   640w,
      /images/photo-960w.jpg   960w,
      /images/photo-1280w.jpg 1280w,
      /images/photo-1920w.jpg 1920w
    "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1280px"
    alt="Descriptive alt text"
    width="1280"
    height="720"
    loading="lazy"
  />
</picture>
```

**Understanding `sizes` attribute:**

* `(max-width: 640px) 100vw` = on small screens, image is 100% of viewport width
* `(max-width: 1024px) 80vw` = on medium screens, image is 80% of viewport width
* `1280px` = on large screens, image has fixed 1280px width (default)

***

## Simple Single-Size Pattern (Current Site Pattern)

For images that don't need responsive sizing:

```html
<picture>
  <source srcset="/images/usai.avif" type="image/avif" />
  <source srcset="/images/usai.webp" type="image/webp" />
  <img src="/images/usai.gif" alt="USAi platform screenshot" />
</picture>
```

**Optimization workflow:**

```bash
# 1. Prepare source
convert source.gif -resize 1280x -quality 100 temp.png

# 2. Generate AVIF
avifenc temp.png images/usai.avif \
  --min 24 --max 32 --cq-level 28 --speed 6 --jobs 8 --chroma-subsample 420

# 3. Generate WebP
cwebp -q 80 -m 6 -af -mt temp.png -o images/usai.webp

# 4. Keep original GIF as fallback (or generate JPEG)
# If replacing, use: cjpeg -quality 85 -progressive -optimize temp.png > images/usai.jpg

# 5. Clean up
rm temp.png
```

***

## Icon & Logo Optimization

### SVG First (Preferred)

**Optimize existing SVG:**

```bash
# Using SVGO
npx svgo input.svg -o output/logo.svg

# Manual optimization
# - Remove unnecessary metadata, comments
# - Combine paths where possible
# - Round coordinates to 2 decimal places
# - Use relative paths instead of absolute
```

**Inline SVG for critical icons:**

```html
<!-- Inline SVG (no HTTP request, can style with CSS) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
</svg>
```

**External SVG for reusable assets:**

```html
<img src="/images/logo.svg" alt="Company logo" width="120" height="40" />
```

### PNG Icons (If SVG Not Available)

```bash
# Generate PNG at 2x resolution for retina displays
convert icon.svg -resize 48x48 -background none icon-24@2x.png

# Optimize PNG
pngquant --quality=80-95 icon-24@2x.png -o icon-24@2x-optimized.png

# Or use oxipng for lossless compression
oxipng -o 6 -i 0 --strip safe icon-24@2x.png
```

**HTML with 2x retina support:**

```html
<img
  src="/images/icon-24.png"
  srcset="/images/icon-24@2x.png 2x"
  alt="Icon"
  width="24"
  height="24"
/>
```

***

## Cloudflare Pages Setup

**`_headers` file in the `public/` directory (deployment root):**

The `_headers` file must be placed in the `public/` directory since that's configured as the `assets.directory` in `wrangler.jsonc`. Cloudflare Pages will read this file from the deployment root.

```
/images/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin
  Timing-Allow-Origin: *
```

**Note:** All media assets (images, videos, and video posters) are stored in the `/images/` directory, so a single rule covers all of them.

**File naming/versioning:** Include version suffixes (e.g., `_v1`) for cache busting:

* `hero-image_v1.avif`
* `screenshot_v2.webp`

When updating an image, bump the version to invalidate the `immutable` cache.

***

## Performance Best Practices

### 1. Always Specify Width & Height

```html
<!-- Good: prevents layout shift -->
<img src="photo.jpg" alt="Description" width="1280" height="720" />

<!-- Bad: causes layout shift when image loads -->
<img src="photo.jpg" alt="Description" />
```

### 2. Use Lazy Loading for Below-the-Fold Images

```html
<!-- Images below the fold -->
<img src="photo.jpg" alt="Description" loading="lazy" width="800" height="600" />

<!-- Above-the-fold/hero images: omit loading attribute or use eager -->
<img src="hero.jpg" alt="Hero" width="1920" height="1080" loading="eager" />
```

### 3. Use Fetchpriority for Critical Images

```html
<!-- Hero/LCP image -->
<img src="hero.jpg" alt="Hero" fetchpriority="high" width="1920" height="1080" />
```

### 4. Preload Critical Images

```html
<!-- In <head> for above-the-fold hero image -->
<link
  rel="preload"
  as="image"
  href="/images/hero.avif"
  type="image/avif"
  imagesrcset="/images/hero-640w.avif 640w, /images/hero-1280w.avif 1280w"
  imagesizes="100vw"
/>
```

### 5. Use CSS for Decorative Images

```css
/* Background images with modern format support */
.hero {
  background-image: url('/images/hero.avif');
  background-image: image-set(
    url('/images/hero.avif') type('image/avif'),
    url('/images/hero.webp') type('image/webp'),
    url('/images/hero.jpg') type('image/jpeg')
  );
}
```

***

## Quality & Size Benchmarks

**AVIF (1280w photo):**

* `--cq-level 24`: ~150-250 KB (high quality)
* `--cq-level 26`: ~100-180 KB (good balance) ⭐
* `--cq-level 28`: ~70-130 KB (smaller, slight quality loss)
* `--cq-level 30`: ~50-100 KB (noticeable quality loss)

**WebP (1280w photo):**

* `-q 90`: ~200-300 KB (high quality)
* `-q 80`: ~120-200 KB (good balance) ⭐
* `-q 75`: ~90-150 KB (smaller, slight quality loss)

**JPEG (1280w photo):**

* `-quality 90`: ~300-500 KB (high quality)
* `-quality 80`: ~180-300 KB (good balance) ⭐
* `-quality 75`: ~130-220 KB (smaller)

**Size comparison for typical 1280px photo:**

* AVIF (`cq 26`): ~120 KB
* WebP (`q 80`): ~180 KB (50% larger than AVIF)
* JPEG (`q 80`): ~250 KB (108% larger than AVIF)

***

## Tool Installation

### macOS (Homebrew)

```bash
# AVIF encoder
brew install libavif

# WebP tools
brew install webp

# JPEG tools
brew install jpeg

# ImageMagick (for resizing/conversion)
brew install imagemagick

# PNG optimization
brew install pngquant oxipng

# SVG optimization
npm install -g svgo

# EXIF tool (metadata removal)
brew install exiftool
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install -y libavif-bin webp libjpeg-turbo-progs imagemagick pngquant oxipng exiftool
npm install -g svgo
```

***

## Troubleshooting & Tips

**Image looks blurry on retina displays:**

* Serve 2x resolution images or use responsive `srcset`
* For fixed-size icons, create `@2x` versions

**AVIF files too large:**

* Increase `--cq-level` (try 28-30 for smaller files)
* Reduce `--chroma-subsample` to 420 (default)
* Lower `--speed` won't significantly reduce size

**WebP files too large:**

* Lower `-q` value (try 75-80)
* Ensure `-m 6` is set (maximum compression effort)

**Colors look washed out:**

* For AVIF: Use `--chroma-subsample 444` for text/screenshots
* For JPEG: Use `-sample 1x1` (4:4:4) instead of `-sample 2x2`
* Convert from PNG source to avoid color space issues

**Images loading slowly:**

* Implement lazy loading for below-fold images
* Use responsive images with `srcset` to serve appropriate sizes
* Verify Cloudflare caching headers are correct
* Preload critical above-fold images

**Accessibility:**

* Always include meaningful `alt` attributes
* Use empty `alt=""` for decorative images
* Include `width` and `height` to prevent layout shift

***

## Quick Reference: Common Commands

**Batch convert directory of images:**

```bash
# AVIF batch conversion
for img in *.{jpg,png}; do
  avifenc "$img" "${img%.*}.avif" --min 20 --max 32 --cq-level 26 --speed 6 --jobs 8
done

# WebP batch conversion
for img in *.{jpg,png}; do
  cwebp -q 80 -m 6 -af -mt "$img" -o "${img%.*}.webp"
done
```

**Generate all formats at once:**

```bash
convert_image() {
  local input=$1
  local base="${input%.*}"
  
  avifenc "$input" "${base}.avif" --min 20 --max 32 --cq-level 26 --speed 6 --jobs 8
  cwebp -q 80 -m 6 -af -mt "$input" -o "${base}.webp"
  cjpeg -quality 80 -progressive -optimize "$input" > "${base}.jpg"
}

# Usage: convert_image photo.png
```

***

*Version:* v1.0 — tailored for static sites served from Cloudflare Pages.
