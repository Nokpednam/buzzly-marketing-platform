const fs = require('fs');
const content = fs.readFileSync('d:/Buzzly_Dev/BuzzlyDev/src/pages/Settings.tsx', 'utf8');
try {
  // Simple check for balanced brackets and tags
  let stack = [];
  let line = 1;
  let col = 1;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '\n') { line++; col = 1; }
    else col++;

    if (char === '{') stack.push({ char, line, col });
    else if (char === '}') {
      if (stack.length === 0 || stack[stack.length - 1].char !== '{') {
        console.log(`Unbalanced } at line ${line}, col ${col}`);
        process.exit(1);
      }
      stack.pop();
    }
    // Simple tag check (ignoring self-closing)
    // This is hard to do right without a real parser, but let's at least check basics
  }
  if (stack.length > 0) {
    const top = stack.pop();
    console.log(`Unbalanced ${top.char} at line ${top.line}, col ${top.col}`);
    process.exit(1);
  }
  console.log("Brackets are balanced.");
} catch (e) {
  console.log(e.message);
}
