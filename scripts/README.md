# Image Preparation Scripts

Scripts for optimizing and preparing images for jimmoffet.me.

## prepare-image.sh

Converts a single image into optimized AVIF, WebP, and JPEG formats for web delivery.

### Installation

First, install the required tools:

```bash
# macOS
brew install imagemagick libavif webp jpeg

# Ubuntu/Debian
sudo apt install imagemagick libavif-bin webp libjpeg-turbo-progs
```

### Basic Usage

```bash
# Convert an image (creates photo.{avif,webp,jpg} at 1280px width)
./scripts/prepare-image.sh photo.jpg

# Specify custom output name
./scripts/prepare-image.sh photo.jpg hero-image

# Specify custom max width
./scripts/prepare-image.sh photo.jpg screenshot 1920
```

### Advanced Usage

**For screenshots/UI images with text:**

```bash
IMAGE_TYPE=screenshot ./scripts/prepare-image.sh ui-demo.png gsai
```

This uses higher quality settings and better chroma subsampling for text clarity.

**For photos:**

```bash
IMAGE_TYPE=photo ./scripts/prepare-image.sh vacation.jpg mountain-view
```

This uses balanced quality settings optimized for photos (this is the default).

### Output

The script creates three optimized files in `public/images/`:

* `{name}.avif` - Smallest file size, best quality
* `{name}.webp` - Fallback for browsers without AVIF support
* `{name}.jpg` - Universal fallback

It also provides an HTML snippet you can copy directly into your code:

```html
<picture>
  <source srcset="/images/hero-image.avif" type="image/avif" />
  <source srcset="/images/hero-image.webp" type="image/webp" />
  <img src="/images/hero-image.jpg" alt="Description here" />
</picture>
```

### Examples

**Optimize a hero image:**

```bash
./scripts/prepare-image.sh raw-photo.jpg hero 1920
```

**Optimize a screenshot:**

```bash
IMAGE_TYPE=screenshot ./scripts/prepare-image.sh screen-capture.png platform-demo
```

**Optimize a portfolio piece:**

```bash
./scripts/prepare-image.sh project-photo.jpg project-thumbnail
```

### Default Settings

**Photos:**

* AVIF: `--cq-level 26`, `--chroma-subsample 420`
* WebP: `-q 80`
* JPEG: `-quality 80`

**Screenshots/UI:**

* AVIF: `--cq-level 28`, `--chroma-subsample 444` (better text rendering)
* WebP: `-q 85`
* JPEG: `-quality 85`

### File Size Expectations

For a typical 1280px wide image:

* **AVIF:** ~80-150 KB (smallest)
* **WebP:** ~120-200 KB (~50% larger than AVIF)
* **JPEG:** ~180-300 KB (~2x larger than AVIF)

## See Also

* [docs/IMAGES.md](../docs/IMAGES.md) - Comprehensive image optimization guide
* [docs/VIDEOS.md](../docs/VIDEOS.md) - Video optimization guide
