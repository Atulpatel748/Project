const fs = require('fs');
const path = require('path');
function tryParse(json) {
  try { return {ok: true, obj: JSON.parse(json)} } catch (e) { return {ok: false, err: e} }
}
function repair(content) {
  // Remove block and line comments
  let s = content.replace(/\/\*[\s\S]*?\*\//g, '');
  s = s.replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '\n');
  // Remove trailing commas before } or ]
  s = s.replace(/,\s*(\}|\])/g, '$1');
  return s;
}
const files = process.argv.slice(2);
if (!files.length) {
  console.error('NO_FILES');
  process.exit(1);
}
for (const f of files) {
  try {
    const orig = fs.readFileSync(f, 'utf8');
    let parsed = tryParse(orig);
    if (parsed.ok) {
      console.log('OK: ' + f);
      continue;
    }
    // backup
    const bak = f + '.bak';
    fs.writeFileSync(bak, orig, {encoding: 'utf8'});
    // try repair
    const repaired = repair(orig);
    parsed = tryParse(repaired);
    if (!parsed.ok) {
      console.log('FAILED: ' + f + ' -- ' + parsed.err.message);
      continue;
    }
    // write normalized JSON
    fs.writeFileSync(f, JSON.stringify(parsed.obj, null, 2) + '\n', {encoding: 'utf8'});
    console.log('FIXED: ' + f + ' (backup: ' + bak + ')');
  } catch (e) {
    console.log('ERROR: ' + f + ' -- ' + e.message);
  }
}
