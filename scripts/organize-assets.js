#!/usr/bin/env node

// Script to help organize Figma exports
// Run this after exporting assets from Figma

const fs = require('fs');
const path = require('path');

const organizeAssets = () => {
  const publicDir = path.join(__dirname, '../public/images');
  const iconsDir = path.join(publicDir, 'icons');
  const uiElementsDir = path.join(publicDir, 'ui-elements');
  const backgroundsDir = path.join(publicDir, 'backgrounds');

  console.log('🎨 Organizing Figma exports...');

  // Check for common icon patterns and move them
  const files = fs.readdirSync(publicDir);
  
  files.forEach(file => {
    const filePath = path.join(publicDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      // Move icons
      if (file.includes('icon') || file.includes('arrow') || file.includes('bracket')) {
        const newPath = path.join(iconsDir, file);
        fs.renameSync(filePath, newPath);
        console.log(`📦 Moved ${file} to icons/`);
      }
      // Move UI elements
      else if (file.includes('diamond') || file.includes('button') || file.includes('ui-')) {
        const newPath = path.join(uiElementsDir, file);
        fs.renameSync(filePath, newPath);
        console.log(`🔷 Moved ${file} to ui-elements/`);
      }
      // Move backgrounds
      else if (file.includes('background') || file.includes('bg-') || file.includes('hero')) {
        const newPath = path.join(backgroundsDir, file);
        fs.renameSync(filePath, newPath);
        console.log(`🖼️ Moved ${file} to backgrounds/`);
      }
    }
  });

  console.log('✅ Asset organization complete!');
  console.log('📝 Don\'t forget to update utils/assets.js with your new file paths');
};

// Run if called directly
if (require.main === module) {
  organizeAssets();
}

module.exports = { organizeAssets };
