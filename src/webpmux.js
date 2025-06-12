'use strict';

const path = require('path');

/**
 * A mapping of platform-architecture combinations to their respective binary paths for 'webpmux'.
 * To add support for a new platform, simply add a new entry to this object.
 * The key should be in the format: `${process.platform}-${process.arch}`.
 * The value is an array of path segments relative to the './bin' directory.
 */
const platformConfig = {
  // macOS (darwin) - Assuming a universal binary or Rosetta 2 compatibility
  'darwin-x64':   ['libwebp_osx', 'bin', 'webpmux'],
  'darwin-arm64': ['libwebp_osx', 'bin', 'webpmux'],

  // Linux
  'linux-x64':    ['libwebp_linux', 'bin', 'webpmux'],
  // 'linux-arm64': ['libwebp_linux_arm64', 'bin', 'webpmux'], // Example for future support

  // Windows
  'win32-x64':    ['libwebp_win64', 'bin', 'webpmux.exe'],
  // 'win32-ia32':  ['libwebp_win32', 'bin', 'webpmux.exe'], // Example for future support
};

/**
 * Determines the correct path to the 'webpmux' binary based on the current
 * operating system and architecture using a scalable configuration map.
 *
 * @throws {Error} If the operating system or architecture is not supported.
 * @returns {string} The absolute path to the webpmux executable.
 */
const getWebpmuxPath = () => {
  const platform = process.platform;
  const arch = process.arch;
  const key = `${platform}-${arch}`;

  // Look up the path segments in our configuration object
  const pathSegments = platformConfig[key];

  // If no entry is found, the platform is unsupported. Throw a clear error.
  if (!pathSegments) {
    throw new Error(`Unsupported platform-architecture combination for webpmux: ${key}. Please add an entry to the platformConfig.`);
  }

  // Construct the full, absolute path using the spread operator for cleanliness.
  // path.join correctly handles the path separators for the current OS.
  return path.join(__dirname, '..', 'bin', ...pathSegments);
};

module.exports = getWebpmuxPath;