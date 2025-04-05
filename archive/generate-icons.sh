#!/bin/bash

# Create icons directory if it doesn't exist
mkdir -p img

# Generate icons in different sizes
sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
    # Use ImageMagick to convert SVG to PNG
    convert -background none -size ${size}x${size} img/icon.svg img/icon-${size}x${size}.png
done

# Generate favicon
convert -background none -size 32x32 img/icon.svg img/favicon.ico

# Generate apple-touch-icon
convert -background none -size 180x180 img/icon.svg img/apple-touch-icon.png

echo "Icons generated successfully!" 