const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const map = {
    'â†’': '→',
    'â€“': '–',
    'â€”': '—',
    'ðŸ”’': '🔒',
    'â­ ': '⭐',
    'ðŸ†“': '🆓',
    'ðŸ” ': '🔍',
    'ðŸ¤ ': '🤝',
    'ðŸ’¸': '💸',
    'â‚¹': '₹',
    'Â©': '©',
    'ðŸ’¡': '💡',
    'ðŸ“š': '📚',
    'â†\u0092': '→',
    'ðŸ”\'': '🔒'
};

const files = walk('./src');
let fixedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const [bad, good] of Object.entries(map)) {
        if (content.includes(bad)) {
            content = content.split(bad).join(good);
            changed = true;
        }
    }
    // Also fix generic cases found in user prompt
    if (content.includes('ðŸ"\'')) { content = content.split('ðŸ"\'').join('🔒'); changed = true; }
    if (content.includes('ðŸ"š')) { content = content.split('ðŸ"š').join('📚'); changed = true; }
    if (content.includes('â→')) { content = content.split('â→').join('→'); changed = true; }
    if (content.includes('ðŸ\'¡')) { content = content.split('ðŸ\'¡').join('💡'); changed = true; }
    if (content.includes('ðŸ½')) { content = content.split('ðŸ½').join('✅'); changed = true; }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        fixedCount++;
        console.log('Fixed mojibake in', file);
    }
}

console.log(`Done. Fixed ${fixedCount} files.`);
