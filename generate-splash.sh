#!/bin/bash

# Create splash directory if it doesn't exist
mkdir -p splash

# Generate splash screens
convert -size 2048x2732 xc:white -gravity center -draw "image Over 0,0 0,0 'img/icon-512.png'" splash/apple-splash-2048-2732.jpg
convert -size 1668x2388 xc:white -gravity center -draw "image Over 0,0 0,0 'img/icon-512.png'" splash/apple-splash-1668-2388.jpg
convert -size 1536x2048 xc:white -gravity center -draw "image Over 0,0 0,0 'img/icon-512.png'" splash/apple-splash-1536-2048.jpg
convert -size 1125x2436 xc:white -gravity center -draw "image Over 0,0 0,0 'img/icon-512.png'" splash/apple-splash-1125-2436.jpg
convert -size 1242x2688 xc:white -gravity center -draw "image Over 0,0 0,0 'img/icon-512.png'" splash/apple-splash-1242-2688.jpg

echo "Splash screens generated successfully!" 