'use strict';

const path = require('path');

/**
 * A mapping of platform-architecture combinations to their respective binary paths.
 * To add support for a new platform (e.g., Linux on ARM64), simply add a new
 * entry to this object. The key should be in the format: `${process.platform}-${process.arch}`.
 * The value is an array of path segments relative to the './bin' directory.
 */
const platformConfig = {
  // macOS (darwin)
  'darwin-x64':   ['libwebp_osx', 'bin', 'cwebp'],
  'darwin-arm64': ['libwebp_osx', 'bin', 'cwebp'], // M1/M2 Macs can run x64 binaries via Rosetta 2

  // Linux
  'linux-x64':    ['libwebp_linux', 'bin', 'cwebp'],
  // 'linux-arm64': ['libwebp_linux_arm64', 'bin', 'cwebp'], // Example: To add ARM64 support
  // 'linux-ia32':  ['libwebp_linux_ia32', 'bin', 'cwebp'],  // Example: To add 32-bit support

  // Windows
  'win32-x64':    ['libwebp_win64', 'bin', 'cwebp.exe'],
  // 'win32-ia32':  ['libwebp_win32', 'bin', 'cwebp.exe'],  // Example: To add 32-bit support
};

/**
 * Determines the correct path to the 'cwebp' binary based on the current
 * operating system and architecture using a scalable configuration map.
 *
 * @throws {Error} If the operating system or architecture is not supported.
 * @returns {string} The absolute path to the cwebp executable.
 */
const getCwebpPath = () => {
  const platform = process.platform;
  const arch = process.arch;
  const key = `${platform}-${arch}`;

  // Look up the path segments in our configuration object
  const pathSegments = platformConfig[key];

  // If no entry is found, the platform is unsupported. Throw a clear error.
  if (!pathSegments) {
    throw new Error(`Unsupported platform-architecture combination: ${key}. Please add an entry to the platformConfig.`);
  }

  // Construct the full, absolute path
  // path.join(__dirname, '..', 'bin', ...pathSegments)
  // The '...' spread operator cleanly inserts the array of path segments.
  return path.join(__dirname, '..', 'bin', ...pathSegments);
};

module.exports = getCwebpPath;