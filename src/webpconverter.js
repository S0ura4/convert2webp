'use strict';

const fs = require('fs');
const { promisify } = require('util');
const { execFile: execFileCallback } = require('child_process');

// Promisify execFile for async/await support, which is safer than exec.
const execFile = promisify(execFileCallback);

// --- Binary Paths ---
// These functions locate the correct binary for the current platform.
const enwebp = require('./cwebp.js');
const dewebp = require('./dwebp.js');
const gifwebp = require('./gwebp.js');
const webpmux = require('./webpmux.js');
const buffer_utils = require('./buffer_utils.js');

/**
 * A centralized command executor to keep the code DRY and handle errors properly.
 * @param {string} binaryPath - The path to the executable (e.g., cwebp).
 * @param {string[]} args - An array of command-line arguments.
 * @returns {Promise<{stdout: string, stderr: string}>} - A promise that resolves with the command's output.
 * @throws {Error} - Throws an error if the command fails to execute.
 */
const executeCommand = async (binaryPath, args) => {
  try {
    // execFile is safer as it doesn't use a shell and handles arguments properly.
    const { stdout, stderr } = await execFile(binaryPath, args);
    if (stderr) {
      // The webp tools often write status information to stderr even on success.
      // We log it as a warning but don't treat it as a failure.
      console.warn(`[webp-lib stderr]: ${stderr}`);
    }
    return { stdout, stderr };
  } catch (error) {
    // Log the full error and re-throw it to ensure the promise is rejected.
    console.error(`[webp-lib error]: Failed to execute ${binaryPath}`, error);
    throw error;
  }
};

/**
 * Grants execute permissions to the WebP binaries. Necessary on Linux and macOS.
 */
module.exports.grant_permission = () => {
  const binaries = [enwebp(), dewebp(), gifwebp(), webpmux()];
  binaries.forEach(exePath => {
    fs.chmodSync(exePath, 0o755);
  });
};

// --- Buffer/Base64 Converters (Simplified) ---
// Directly export the utility functions without the redundant .then() wrapper.

/**
 * Converts a base64 image string to a WebP base64 string.
 * @see buffer_utils.base64str2webp
 */
module.exports.str2webpstr = buffer_utils.base64str2webp;

/**
 * Converts an image buffer to a WebP buffer.
 * @see buffer_utils.buffer2webp
 */
module.exports.buffer2webpbuffer = buffer_utils.buffer2webp;


// --- Core Conversion Functions ---

/**
 * Converts an image to WebP format.
 * @param {string} input_image - Path to the input image (e.g., 'image.png').
 * @param {string} output_image - Path for the output WebP image (e.g., 'image.webp').
 * @param {string} option - Conversion options (e.g., "-q 80").
 * @param {string} [logging='-quiet'] - Logging level.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
module.exports.cwebp = (input_image, output_image, option, logging = '-quiet') => {
  const args = [...option.split(' '), input_image, '-o', output_image, logging];
  return executeCommand(enwebp(), args);
};

/**
 * Converts a WebP image to another format (e.g., PNG, JPEG).
 * @param {string} input_image - Path to the input WebP image (e.g., 'image.webp').
 * @param {string} output_image - Path for the output image (e.g., 'image.png').
 * @param {string} option - Conversion options (e.g., "-o"). The output format is inferred from the output file extension.
 * @param {string} [logging='-quiet'] - Logging level.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
module.exports.dwebp = (input_image, output_image, option, logging = '-quiet') => {
  const args = [input_image, ...option.split(' '), '-o', output_image, logging];
  return executeCommand(dewebp(), args);
};

/**
 * Converts a GIF image to animated WebP format.
 * @param {string} input_image - Path to the input GIF image (e.g., 'animation.gif').
 * @param {string} output_image - Path for the output WebP image (e.g., 'animation.webp').
 * @param {string} option - Conversion options (e.g., "-q 80").
 * @param {string} [logging='-quiet'] - Logging level.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
module.exports.gwebp = (input_image, output_image, option, logging = '-quiet') => {
  const args = [...option.split(' '), input_image, '-o', output_image, logging];
  return executeCommand(gifwebp(), args);
};


// --- WebP Muxing Functions ---

/**
 * Adds ICC, XMP, or EXIF metadata to a WebP file.
 * @param {string} input_image - Path to the input WebP file.
 * @param {string} output_image - Path for the output WebP file.
 * @param {string} metadata_path - Path to the metadata file (e.g., 'profile.icc').
 * @param {'icc'|'xmp'|'exif'} metadata_type - The type of metadata to set.
 * @param {string} [logging='-quiet'] - Logging level.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
module.exports.webpmux_add = (input_image, output_image, metadata_path, metadata_type, logging = '-quiet') => {
  const args = ['-set', metadata_type, metadata_path, input_image, '-o', output_image, logging];
  return executeCommand(webpmux(), args);
};

/**
 * Extracts ICC, XMP, or EXIF metadata from a WebP file.
 * @param {string} input_image - Path to the input WebP file.
 * @param {string} output_path - Path to save the extracted metadata.
 * @param {'icc'|'xmp'|'exif'} metadata_type - The type of metadata to get.
 * @param {string} [logging='-quiet'] - Logging level.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
module.exports.webpmux_extract = (input_image, output_path, metadata_type, logging = '-quiet') => {
  const args = ['-get', metadata_type, input_image, '-o', output_path, logging];
  return executeCommand(webpmux(), args);
};

/**
 * Strips ICC, XMP, or EXIF metadata from a WebP file.
 * @param {string} input_image - Path to the input WebP file.
 * @param {string} output_image - Path for the output WebP file.
 * @param {'icc'|'xmp'|'exif'} metadata_type - The type of metadata to strip.
 * @param {string} [logging='-quiet'] - Logging level.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
module.exports.webpmux_strip = (input_image, output_image, metadata_type, logging = '-quiet') => {
  const args = ['-strip', metadata_type, input_image, '-o', output_image, logging];
  return executeCommand(webpmux(), args);
};

/**
 * Creates an animated WebP file from a series of WebP images.
 * @param {Array<{path: string, offset: string}>} input_frames - Array of frame objects.
 * @param {string} output_image - Path for the output animated WebP file.
 * @param {string|number} loop - Number of times to loop the animation (0 for infinite).
 * @param {string} bgcolor - Background color in A,R,G,B format (e.g., "255,255,255,255").
 * @param {string} [logging='-quiet'] - Logging level.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
module.exports.webpmux_animate = (input_frames, output_image, loop, bgcolor, logging = '-quiet') => {
  // Use modern array methods to build arguments cleanly
  const frameArgs = input_frames.flatMap(frame => ['-frame', frame.path, frame.offset]);
  const args = [...frameArgs, '-loop', loop, '-bgcolor', bgcolor, '-o', output_image, logging];
  return executeCommand(webpmux(), args);
};

/**
 * Gets a single frame from an animated WebP file.
 * @param {string} input_image - Path to the input animated WebP file.
 * @param {string} output_image - Path for the output frame.
 * @param {string|number} frame_number - The frame number to extract.
 * @param {string} [logging='-quiet'] - Logging level.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
module.exports.webpmux_getframe = (input_image, output_image, frame_number, logging = '-quiet') => {
  const args = ['-get', 'frame', String(frame_number), input_image, '-o', output_image, logging];
  return executeCommand(webpmux(), args);
};