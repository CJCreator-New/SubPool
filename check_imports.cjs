const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const getFiles = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getFiles(filePath, fileList);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
};

const allFiles = getFiles(srcDir);
let hasDeadImports = false;

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Match `from '...'` or `from "..."`
    const importRegex = /from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        // Ignore external modules (node_modules usually start with word chars and aren't relative)
        if (!importPath.startsWith('.')) continue;

        // Resolve relative path
        const dir = path.dirname(file);
        let resolved = path.resolve(dir, importPath);

        // Check if the file exists (it could have extensions .ts, .tsx, .js, .json, .css, etc or be a folder with index)
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css'];
        let exists = false;

        if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
            exists = true;
        } else {
            for (const ext of extensions) {
                if (fs.existsSync(resolved + ext)) {
                    exists = true;
                    break;
                }
            }
            if (!exists && fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
                for (const ext of extensions) {
                    if (fs.existsSync(path.join(resolved, 'index' + ext))) {
                        exists = true;
                        break;
                    }
                }
            }
        }

        if (!exists) {
            console.log(`[DEAD IMPORT] In ${file.replace(__dirname, '')}: from '${importPath}'`);
            hasDeadImports = true;
        }
    }
});

if (!hasDeadImports) {
    console.log('[PASS] No dead imports found.');
}
