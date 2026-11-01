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
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Folders/All Projects/Antigravity/ProjectSync/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/Ã‚·/g, '·');
  content = content.replace(/Ã¢â‚¬â€ /g, '—');
  content = content.replace(/Ã¢Å’Ëœ/g, '⌘');
  content = content.replace(/â€”/g, '—');
  content = content.replace(/Â·/g, '·');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
});
