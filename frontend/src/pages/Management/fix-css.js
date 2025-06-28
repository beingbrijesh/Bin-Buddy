import fs from 'fs';
import path from 'path';

// Read the CSS file
try {
  const cssContent = fs.readFileSync('Management.css', 'utf8');
  
  // Fix the unclosed activity-list block
  const fixedContent = cssContent.replace(
    /\/\* Activity Cards \*\/\s*\.activity-list\s*{\s*display: flex;\s*flex-direction: column;/,
    '/* Activity Cards */\n.activity-list {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}'
  );
  
  // Write the fixed content back to the file
  fs.writeFileSync('Management.css', fixedContent, 'utf8');
  console.log('CSS file fixed successfully!');
} catch (error) {
  console.error('Error fixing CSS file:', error);
} 