const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "src");

// Alias mapping
const aliases = {
  "@/utils/": "utils/",
  "@/middleware/": "middleware/",
  "@/controller/": "controller/",
  "@/model/": "model/",
  "@/service/": "service/",
  "@/interfaces/": "interfaces/"
};

// Recursively read all .ts files
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) walkDir(fullPath);
    else if (file.endsWith(".ts")) fixFile(fullPath);
  });
}

// Replace alias imports with correct relative paths
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  for (const [alias, relPath] of Object.entries(aliases)) {
    // Match both single and double quotes
    const regex = new RegExp(`from\\s+['"]${alias}`, "g");
    if (regex.test(content)) {
      // Compute relative path from current file to SRC_DIR + alias folder
      const relativePath = path.relative(path.dirname(filePath), path.join(SRC_DIR, relPath)).replace(/\\/g, "/");
      content = content.replace(regex, `from '${relativePath}/`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Fixed imports in: ${filePath}`);
  }
}

walkDir(SRC_DIR);
console.log("All imports fixed!");