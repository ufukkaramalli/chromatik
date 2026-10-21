const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Error: No version provided to sync-versions.js');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const filesToUpdate = [
  path.join(rootDir, 'package.json'),
  path.join(rootDir, 'frontend', 'package.json'),
  path.join(rootDir, 'backend', 'package.json'),
];

console.log(`[sync-versions] Syncing version ${newVersion} across workspaces...`);

filesToUpdate.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(content);
      const oldVersion = json.version;
      json.version = newVersion;
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      console.log(`[sync-versions] Updated ${path.relative(rootDir, filePath)}: ${oldVersion} -> ${newVersion}`);
    } catch (err) {
      console.error(`[sync-versions] Failed to update ${filePath}:`, err);
      process.exit(1);
    }
  } else {
    console.warn(`[sync-versions] File not found: ${filePath}`);
  }
});

console.log('[sync-versions] Version synchronization complete.');
