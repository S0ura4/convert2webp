'use strict';

const fs = require('fs/promises'); // Use the modern promise-based fs API
const path = require('path');
const { v4: uuid } = require('uuid');
const temp_path = require('./temp_path.js');
const webp = require('./webpconverter.js');

/**
 * Core conversion function that handles in-memory data by writing it to
 * temporary files, running cwebp, and cleaning up afterwards.
 * This is the single source of truth for the conversion logic.
 *
 * @param {Buffer} inputBuffer The image data to convert.
 * @param {string} imageType The file extension of the input image (e.g., 'png', 'jpg').
 * @param {string} option The options string for the cwebp command (e.g., '-q 80').
 * @param {string} [extra_path] Optional subdirectory within the temp directory.
 * @returns {Promise<Buffer>} A promise that resolves with the resulting WebP buffer.
 * @throws {Error} Throws if any step of the process fails.
 */
const convertToWebpBuffer = async (inputBuffer, imageType, option, extra_path) => {
  const filename = uuid();
  const tempDir = temp_path(extra_path);
  const inputFilePath = path.join(tempDir, `${filename}.${imageType}`);
  const outputFilePath = path.join(tempDir, `${filename}.webp`);

  // The 'finally' block is crucial. It guarantees that we attempt to clean up
  // the temporary files, regardless of whether the 'try' block succeeds or fails.
  try {
    // 1. Write the input buffer to a temporary file.
    await fs.writeFile(inputFilePath, inputBuffer);

    // 2. Run the cwebp conversion process. Awaiting a promise-based function is clean.
    await webp.cwebp(inputFilePath, outputFilePath, option);

    // 3. Read the resulting WebP file back into a buffer.
    const outputBuffer = await fs.readFile(outputFilePath);

    // 4. Return the result.
    return outputBuffer;
  } catch (error) {
    // If an error occurs, log it and re-throw it to ensure the caller's promise rejects.
    console.error('WebP conversion failed:', error);
    throw error;
  } finally {
    // 5. Clean up both temporary files.
    // Use { force: true } to prevent errors if files were never created.
    await fs.rm(inputFilePath, { force: true });
    await fs.rm(outputFilePath, { force: true });
  }
};

/**
 * Converts an image buffer to a WebP buffer.
 * @param {Buffer} buffer - The input image buffer.
 * @param {string} image_type - The file extension of the input image (e.g., 'png').
 * @param {string} option - Options for the cwebp command (e.g., '-q 80').
 * @param {string} [extra_path] - Optional subdirectory for temp files.
 * @returns {Promise<Buffer>} A promise that resolves with the WebP buffer.
 */
module.exports.buffer2webp = (buffer, image_type, option, extra_path) => {
  // Directly call the core function. No more inefficient conversions.
  return convertToWebpBuffer(buffer, image_type, option, extra_path);
};

/**
 * Converts a base64 image string to a WebP base64 string.
 * @param {string} base64str - The input image as a base64 string.
 * @param {string} image_type - The file extension of the input image (e.g., 'png').
 * @param {string} option - Options for the cwebp command (e.g., '-q 80').
 * @param {string} [extra_path] - Optional subdirectory for temp files.
 * @returns {Promise<string>} A promise that resolves with the WebP image as a base64 string.
 */
module.exports.base64str2webp = async (base64str, image_type, option, extra_path) => {
  // First, convert the base64 string to a buffer.
  const inputBuffer = Buffer.from(base64str, 'base64');

  // Then, use the same core conversion logic.
  const outputBuffer = await convertToWebpBuffer(inputBuffer, image_type, option, extra_path);

  // Finally, convert the resulting buffer back to a base64 string.
  return outputBuffer.toString('base64');
};