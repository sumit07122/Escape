const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      res = res.concat(walk(p));
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      res.push(p);
    }
  }
  return res;
}

const files = walk('src');
console.log('Auditing', files.length, 'source files for interactive elements, links, buttons, and typography...');

const issues = {
  deadLinks: [],
  emptyHandlers: [],
  monoBadges: [],
  todoButtons: [],
};

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    if (trimmed.includes('href="#"') || trimmed.includes("href='#'")) {
      issues.deadLinks.push({ file, lineNum, text: trimmed });
    }

    if (/onClick=\{?\(\)?\s*=>\s*\{\s*\}?/.test(trimmed)) {
      issues.emptyHandlers.push({ file, lineNum, text: trimmed });
    }

    if (trimmed.includes('font-mono') && !file.includes('Ticket') && !file.includes('BoardingPass') && !file.includes('qr.ts')) {
      // Check if font-mono is on a button, badge, header, or card
      if (/button|<button|rounded|px-|py-|badge|tag|card/i.test(trimmed)) {
        issues.monoBadges.push({ file, lineNum, text: trimmed });
      }
    }

    if (trimmed.toLowerCase().includes('todo') && (trimmed.includes('<button') || trimmed.includes('onClick'))) {
      issues.todoButtons.push({ file, lineNum, text: trimmed });
    }
  });
}

console.log('\n--- AUDIT RESULTS ---');
console.log(`Dead Links (href="#"): ${issues.deadLinks.length}`);
issues.deadLinks.forEach(i => console.log(`  - [${i.file}:${i.lineNum}] ${i.text}`));

console.log(`\nEmpty OnClick Handlers: ${issues.emptyHandlers.length}`);
issues.emptyHandlers.forEach(i => console.log(`  - [${i.file}:${i.lineNum}] ${i.text}`));

console.log(`\nMonospace Badges/Buttons (potential cheap typography): ${issues.monoBadges.length}`);
issues.monoBadges.slice(0, 15).forEach(i => console.log(`  - [${i.file}:${i.lineNum}] ${i.text}`));
if (issues.monoBadges.length > 15) console.log(`  ... and ${issues.monoBadges.length - 15} more`);

console.log(`\nTODO Buttons: ${issues.todoButtons.length}`);
issues.todoButtons.forEach(i => console.log(`  - [${i.file}:${i.lineNum}] ${i.text}`));
