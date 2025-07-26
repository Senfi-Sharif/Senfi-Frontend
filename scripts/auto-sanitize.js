#!/usr/bin/env node

/**
 * Auto-sanitize script
 * Automatically adds sanitizeHTML import and usage to files that use dangerouslySetInnerHTML
 */

const fs = require('fs');
const path = require('path');

function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

function addSanitizeImport(content, filePath) {
  const lines = content.split('\n');
  const importLines = [];
  let hasSanitizeImport = false;
  let lastImportIndex = -1;
  
  // Check if sanitizeHTML is already imported
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('import') && line.includes('sanitizeHTML')) {
      hasSanitizeImport = true;
      break;
    }
    if (line.trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (!hasSanitizeImport) {
    // Calculate relative path to security utils
    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, '..', 'src', 'utils', 'security'))
      .replace(/\\/g, '/'); // Convert Windows paths to Unix style
    
    const importStatement = `import { sanitizeHTML } from '${relativePath}';`;
    
    if (lastImportIndex >= 0) {
      // Add after the last import
      lines.splice(lastImportIndex + 1, 0, importStatement);
    } else {
      // Add at the beginning
      lines.unshift(importStatement);
    }
    
    return lines.join('\n');
  }
  
  return content;
}

function fixDangerouslySetInnerHTML(content) {
  // Pattern to match dangerouslySetInnerHTML without sanitizeHTML
  const pattern = /dangerouslySetInnerHTML\s*=\s*\{\s*__html:\s*([^}]+)\s*\}/g;
  let modified = false;
  let newContent = content;
  
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const fullMatch = match[0];
    const htmlContent = match[1].trim();
    
    // Check if sanitizeHTML is already being used
    if (!htmlContent.includes('sanitizeHTML(')) {
      // Replace with sanitized version
      const sanitizedVersion = fullMatch.replace(
        `__html: ${htmlContent}`,
        `__html: sanitizeHTML(${htmlContent})`
      );
      newContent = newContent.replace(fullMatch, sanitizedVersion);
      modified = true;
    }
  }
  
  return { content: newContent, modified };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file uses dangerouslySetInnerHTML
    if (!content.includes('dangerouslySetInnerHTML')) {
      return false;
    }
    
    console.log(`Processing: ${path.relative(__dirname, filePath)}`);
    
    // Add sanitizeHTML import if needed
    let newContent = addSanitizeImport(content, filePath);
    
    // Fix dangerouslySetInnerHTML usage
    const { content: fixedContent, modified } = fixDangerouslySetInnerHTML(newContent);
    
    if (modified || newContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  const files = findFiles(srcDir);
  
  console.log(`🔍 Found ${files.length} files to check...`);
  
  let fixedCount = 0;
  for (const file of files) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files with sanitizeHTML imports and usage.`);
  
  if (fixedCount > 0) {
    console.log('\n📝 Remember to:');
    console.log('1. Review the changes to ensure they are correct');
    console.log('2. Test the application to make sure everything works');
    console.log('3. Commit the changes with a descriptive message');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  findFiles,
  addSanitizeImport,
  fixDangerouslySetInnerHTML,
  processFile
}; 