#!/usr/bin/env bash

# prepare-image.sh
# Convert and optimize images for jimmoffet.me
# Usage: ./scripts/prepare-image.sh input.jpg [output-name] [max-width]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
MAX_WIDTH=1280
OUTPUT_DIR="public/images"
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Function to print colored output
print_info() {
	echo -e "${GREEN}✓${NC} $1"
}

print_error() {
	echo -e "${RED}✗${NC} $1"
}

print_warning() {
	echo -e "${YELLOW}!${NC} $1"
}

# Function to check if command exists
check_command() {
	if ! command -v "$1" &>/dev/null; then
		print_error "Required command '$1' not found. Please install it first."
		echo "  macOS: brew install $2"
		exit 1
	fi
}

# Check required tools
check_command "magick" "imagemagick"
check_command "avifenc" "libavif"
check_command "cwebp" "webp"
check_command "cjpeg" "jpeg"

# Parse arguments
if [ $# -lt 1 ]; then
	print_error "Usage: $0 <input-file> [output-name] [max-width]"
	echo ""
	echo "Examples:"
	echo "  $0 photo.jpg                    # Creates photo.{avif,webp,jpg} at 1280px width"
	echo "  $0 photo.jpg hero               # Creates hero.{avif,webp,jpg} at 1280px width"
	echo "  $0 photo.jpg screenshot 1920    # Creates screenshot.{avif,webp,jpg} at 1920px width"
	exit 1
fi

INPUT_FILE="$1"
OUTPUT_NAME="${2:-$(basename "$INPUT_FILE" | sed 's/\.[^.]*$//')}"
MAX_WIDTH="${3:-$MAX_WIDTH}"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
	print_error "Input file '$INPUT_FILE' not found"
	exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Determine if this is a photo or screenshot/UI
# You can override this by setting IMAGE_TYPE environment variable
# IMAGE_TYPE=screenshot ./scripts/prepare-image.sh input.jpg
IMAGE_TYPE="${IMAGE_TYPE:-photo}"

print_info "Processing: $INPUT_FILE"
print_info "Output name: $OUTPUT_NAME"
print_info "Max width: ${MAX_WIDTH}px"
print_info "Type: $IMAGE_TYPE"
echo ""

# Step 1: Resize and prepare source
print_info "Resizing to ${MAX_WIDTH}px width..."
magick "$INPUT_FILE" -resize "${MAX_WIDTH}x>" -quality 100 "$TEMP_DIR/source.png"

# Step 2: Generate AVIF
print_info "Generating AVIF..."
if [ "$IMAGE_TYPE" = "screenshot" ] || [ "$IMAGE_TYPE" = "ui" ]; then
	# For screenshots/UI with text: higher quality, better chroma
	avifenc "$TEMP_DIR/source.png" "$OUTPUT_DIR/${OUTPUT_NAME}.avif" \
		-s 6 -j 8 -y 444 -a end-usage=q -a cq-level=28
else
	# For photos: balanced quality
	avifenc "$TEMP_DIR/source.png" "$OUTPUT_DIR/${OUTPUT_NAME}.avif" \
		-s 6 -j 8 -y 420 -a end-usage=q -a cq-level=26
fi

# Step 3: Generate WebP
print_info "Generating WebP..."
if [ "$IMAGE_TYPE" = "screenshot" ] || [ "$IMAGE_TYPE" = "ui" ]; then
	cwebp -q 85 -m 6 -af -mt "$TEMP_DIR/source.png" -o "$OUTPUT_DIR/${OUTPUT_NAME}.webp"
else
	cwebp -q 80 -m 6 -af -mt "$TEMP_DIR/source.png" -o "$OUTPUT_DIR/${OUTPUT_NAME}.webp"
fi

# Step 4: Generate JPEG
print_info "Generating JPEG..."
if [ "$IMAGE_TYPE" = "screenshot" ] || [ "$IMAGE_TYPE" = "ui" ]; then
	# Use cjpeg for progressive, optimized JPEGs (UI/text: 1x1 sampling)
	cjpeg -quality 85 -progressive -optimize -sample 1x1 "$TEMP_DIR/source.png" > "$OUTPUT_DIR/${OUTPUT_NAME}.jpg"
else
	# Use cjpeg for progressive, optimized JPEGs (photos: 2x2 sampling)
	cjpeg -quality 80 -progressive -optimize -sample 2x2 "$TEMP_DIR/source.png" > "$OUTPUT_DIR/${OUTPUT_NAME}.jpg"
fi

# Clean up
rm -rf "$TEMP_DIR"

# Display results
echo ""
print_info "Images created in $OUTPUT_DIR/:"
echo ""

# Get file sizes and display them
AVIF_SIZE=$(du -h "$OUTPUT_DIR/${OUTPUT_NAME}.avif" | cut -f1)
WEBP_SIZE=$(du -h "$OUTPUT_DIR/${OUTPUT_NAME}.webp" | cut -f1)
JPEG_SIZE=$(du -h "$OUTPUT_DIR/${OUTPUT_NAME}.jpg" | cut -f1)

echo "  ${OUTPUT_NAME}.avif  ${AVIF_SIZE}"
echo "  ${OUTPUT_NAME}.webp  ${WEBP_SIZE}"
echo "  ${OUTPUT_NAME}.jpg   ${JPEG_SIZE}"

echo ""
print_info "HTML snippet:"
echo ""
cat <<EOF
<picture>
  <source srcset="/images/${OUTPUT_NAME}.avif" type="image/avif" />
  <source srcset="/images/${OUTPUT_NAME}.webp" type="image/webp" />
  <img src="/images/${OUTPUT_NAME}.jpg" alt="Description here" />
</picture>
EOF

echo ""
print_info "Done!"
