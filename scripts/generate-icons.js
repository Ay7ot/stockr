#!/usr/bin/env node

/**
 * Icon Generation Script
 * 
 * Converts the SVG logo to various PNG sizes for PWA icons and favicons.
 * 
 * Usage:
 *   node scripts/generate-icons.js
 * 
 * Requirements:
 *   npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Error: sharp is required. Install it with: npm install sharp');
  process.exit(1);
}

const SVG_PATH = path.join(__dirname, '../public/logo.svg');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Icon sizes needed for PWA and favicons
// iOS rounds the icons automatically, so no padding needed
const ICONS = [
  { name: 'favicon-16x16.png', size: 16, padding: 0 },
  { name: 'favicon-32x32.png', size: 32, padding: 0 },
  { name: 'apple-touch-icon.png', size: 180, padding: 0 },
  { name: 'icon-192.png', size: 192, padding: 0 },
  { name: 'icon-512.png', size: 512, padding: 0 },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from SVG...\n');

  // Read SVG file
  if (!fs.existsSync(SVG_PATH)) {
    console.error(`❌ Error: SVG file not found at ${SVG_PATH}`);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);

  for (const icon of ICONS) {
    const outputPath = path.join(PUBLIC_DIR, icon.name);
    
    try {
      if (icon.padding === 0) {
        // No padding - fill entire icon space
        await sharp(svgBuffer)
          .resize(icon.size, icon.size, {
            fit: 'cover',
            position: 'center'
          })
          .png({
            compressionLevel: 9,
            quality: 100,
          })
          .toFile(outputPath);
      } else {
        // With padding
        const innerSize = icon.size - (icon.padding * 2);
        await sharp(svgBuffer)
          .resize(innerSize, innerSize, {
            fit: 'contain',
            background: { r: 0, g: 113, b: 227, alpha: 1 }
          })
          .extend({
            top: icon.padding,
            bottom: icon.padding,
            left: icon.padding,
            right: icon.padding,
            background: { r: 0, g: 113, b: 227, alpha: 1 }
          })
          .png({
            compressionLevel: 9,
            quality: 100,
          })
          .toFile(outputPath);
      }

      console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`  ❌ Failed to generate ${icon.name}:`, error.message);
    }
  }

  // Generate ICO file for older browsers
  try {
    fs.copyFileSync(path.join(PUBLIC_DIR, 'favicon-32x32.png'), path.join(PUBLIC_DIR, 'favicon.ico'));
    console.log(`  ✅ favicon.ico (copied from 32x32)`);
  } catch (error) {
    console.error(`  ❌ Failed to generate favicon.ico:`, error.message);
  }

  // Generate optimized OG image
  console.log('\n🖼️ Generating OG image...');
  try {
    await generateOGImage(svgBuffer, path.join(PUBLIC_DIR, 'og-image.png'));
    console.log(`  ✅ og-image.png (1200x630, optimized)`);
  } catch (error) {
    console.error(`  ❌ Failed to generate og-image.png:`, error.message);
  }

  console.log('\n✨ All icons generated successfully!');
  console.log('\nGenerated files:');
  ICONS.forEach(icon => console.log(`   - public/${icon.name}`));
  console.log(`   - public/favicon.ico`);
  console.log(`   - public/og-image.png`);
}

/**
 * Generate an optimized OG image (1200x630)
 * Uses a clean design with logo and brand text
 */
async function generateOGImage(svgBuffer, outputPath) {
  const width = 1200;
  const height = 630;
  
  // Brand colors from design system
  const bgColor = { r: 245, g: 245, b: 247 }; // #f5f5f7 --ink-50
  const accentColor = { r: 0, g: 113, b: 227 }; // #0071e3 --blue
  const textColor = { r: 28, g: 28, b: 30 }; // #1c1c1e --ink-800
  
  // Create a canvas-like approach using sharp
  // We'll create a composite image with background, logo, and text
  
  // Resize logo for OG image (320px)
  const logoSize = 280;
  const logoBuffer = await sharp(svgBuffer)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();
  
  // Create the base image with background
  const baseImage = sharp({
    create: {
      width: width,
      height: height,
      channels: 3,
      background: bgColor
    }
  });
  
  // Add subtle gradient overlay
  const gradientOverlay = await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      {
        input: Buffer.from(`
          <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#e8f1fc;stop-opacity:0.4" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bgGrad)"/>
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toBuffer();
  
  // Add accent bar on the left
  const accentBar = await sharp({
    create: {
      width: 8,
      height: height,
      channels: 3,
      background: accentColor
    }
  }).png().toBuffer();
  
  // Create text elements as SVG
  const titleSvg = `
    <svg width="600" height="200" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="70" font-family="DM Sans, -apple-system, BlinkMacSystemFont, sans-serif" 
            font-size="72" font-weight="700" fill="#1c1c1e" letter-spacing="-2">
        Stockr
      </text>
      <text x="0" y="130" font-family="DM Sans, -apple-system, BlinkMacSystemFont, sans-serif" 
            font-size="32" font-weight="400" fill="#636366">
        Inventory &amp; Sales Tracker
      </text>
    </svg>
  `;
  
  const taglineSvg = `
    <svg width="500" height="60" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="35" font-family="DM Sans, -apple-system, BlinkMacSystemFont, sans-serif" 
            font-size="24" font-weight="400" fill="#8e8e93">
        Smart tracking for gadget businesses
      </text>
    </svg>
  `;
  
  // Compose the final image
  await baseImage
    .composite([
      { input: gradientOverlay, top: 0, left: 0, blend: 'over' },
      { input: accentBar, top: 0, left: 0 },
      { input: logoBuffer, top: (height - logoSize) / 2, left: 750 },
      { input: Buffer.from(titleSvg), top: 200, left: 80 },
      { input: Buffer.from(taglineSvg), top: 340, left: 80 }
    ])
    .png({
      compressionLevel: 9,
      quality: 85,
      palette: true, // Use palette-based PNG for smaller file size
      effort: 10 // Maximum compression effort
    })
    .toFile(outputPath);
}

generateIcons().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
