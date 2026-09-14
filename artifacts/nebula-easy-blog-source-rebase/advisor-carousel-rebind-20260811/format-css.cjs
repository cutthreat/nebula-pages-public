const fs = require('node:fs');

const file = process.argv[2];
if (!file) throw new Error('CSS path is required');

const css = fs.readFileSync(file, 'utf8');
const formatted = css
  .replace(/}\s*/g, '}\n')
  .replace(/\n{2,}/g, '\n')
  .trimEnd() + '\n';

fs.writeFileSync(file, formatted);
