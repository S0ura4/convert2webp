'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Gets a path to a directory suitable for temporary files.
 *
 * This function follows modern best practices:
 * 1. If a custom path is provided, it uses that path.
 * 2. If no custom path is provided, it defaults to a dedicated subfolder
 *    within the operating system's standard temporary directory (e.g., /tmp/webp-converter-js).
 *    This is safer and cleaner than creating a 'temp' folder in the project root.
 * 3. It ensures that the target directory exists before returning the path.
 *
 * @param {string} [customPath] - An optional, user-defined path to use for temp files.
 * @returns {string} An absolute path to a directory that is guaranteed to exist.
 */
const getTempPath = (customPath) => {
  // Determine the target directory. Use the custom path if provided,
  // otherwise, create a default path inside the system's temp directory.
  const targetPath = customPath || path.join(os.tmpdir(), 'webp-converter-js');

  // Ensure the directory exists.
  // The { recursive: true } option prevents errors if the directory already exists
  // and creates parent directories as needed. This is an idempotent operation.
  try {
    fs.mkdirSync(targetPath, { recursive: true });
  } catch (error) {
    console.error(`Failed to create temporary directory at: ${targetPath}`, error);
    // Re-throw the error to ensure the calling process fails loudly.
    throw error;
  }

  return targetPath;
};

// Renamed module export for clarity.
module.exports = getTempPath;