'use strict';

// Import the necessary modules
const webp = require('./src/webpconverter.js');
const fs = require('fs/promises');

/**
 * Main function to run a few key examples.
 */
async function runCoreExamples() {
  console.log('--- Starting WebP Converter Examples ---');

  // 1. Grant execute permissions (essential for Linux/macOS)
  try {
    webp.grant_permission();
    console.log('Step 1: Permissions granted successfully.');
  } catch (error) {
    console.error('Error granting permissions:', error);
    return; // Stop if this fails
  }

  // --- Example 1: cwebp (Convert JPG to WebP) ---
  try {
    console.log('\nStep 2: Converting sample.jpg to WebP...');
    const cwebpResult = await webp.cwebp('./sample.jpg', './output_cwebp.webp', '-q 80 -m 6');
    console.log('-> Success! Created ./output_cwebp.webp');
  } catch (error) {
    console.error('-> cwebp failed:', error);
  }

  // --- Example 2: dwebp (Convert WebP back to PNG) ---
  try {
    console.log('\nStep 3: Converting output_cwebp.webp back to PNG...');
    const dwebpResult = await webp.dwebp('./output_cwebp.webp', './output_dwebp.png', '-o');
    console.log('-> Success! Created ./output_dwebp.png');
  } catch (error) {
    console.error('-> dwebp failed:', error);
  }

  // --- Example 3: gwebp (Convert GIF to Animated WebP) ---
  try {
    console.log('\nStep 4: Converting sample.gif to animated WebP...');
    const gwebpResult = await webp.gwebp('./sample.gif', './output_gwebp.webp', '-q 75');
    console.log('-> Success! Created ./output_gwebp.webp');
  } catch (error) {
    console.error('-> gwebp failed:', error);
  }

  // --- Example 4: Buffer Conversion ---
  try {
    console.log('\nStep 5: Converting an image from a buffer...');
    // Read the image file into a buffer
    const inputBuffer = await fs.readFile('./sample.jpg');

    // Convert the buffer to a WebP buffer
    const outputBuffer = await webp.buffer2webpbuffer(inputBuffer, 'jpg', '-q 70');

    // Save the resulting buffer to a file
    await fs.writeFile('./output_from_buffer.webp', outputBuffer);
    console.log('-> Success! Created ./output_from_buffer.webp');
  } catch (error) {
    console.error('-> Buffer conversion failed:', error);
  }

  console.log('\n--- All examples have been executed. ---');
}

// Run the main function and catch any errors that might occur.
runCoreExamples().catch(error => {
  console.error('\n[FATAL ERROR] The script encountered a problem:', error);
});