#!/usr/bin/env node

/**
 * Security Audit Script for Senfi Web Application
 * 
 * This script scans the codebase for common security vulnerabilities:
 * - XSS vulnerabilities (dangerouslySetInnerHTML without sanitization)
 * - Insecure CSP configurations
 * - Hardcoded secrets
 * - Insecure dependencies
 * - Missing security headers
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Scan for XSS vulnerabilities
function scanForXSSVulnerabilities() {
  logSection('Scanning for XSS Vulnerabilities');

  const srcDir = path.join(__dirname, 'src');
  const vulnerabilities = [];

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for dangerouslySetInnerHTML without sanitization
        const dangerousPattern = /dangerouslySetInnerHTML\s*=\s*\{\s*__html:\s*([^}]+)\s*\}/g;
        let match;

        while ((match = dangerousPattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const sanitizedPattern = /sanitizeHTML\s*\(\s*[^)]+\s*\)/;

          if (!sanitizedPattern.test(match[0])) {
            vulnerabilities.push({
              file: path.relative(__dirname, filePath),
              line: lineNumber,
              issue: 'dangerouslySetInnerHTML without sanitization',
              code: match[0].trim()
            });
          }
        }
      }
    }
  }

  scanDirectory(srcDir);

  if (vulnerabilities.length === 0) {
    logSuccess('No XSS vulnerabilities found!');
  } else {
    logError(`${vulnerabilities.length} XSS vulnerabilities found:`);
    vulnerabilities.forEach(vuln => {
      logError(`  ${vuln.file}:${vuln.line} - ${vuln.issue}`);
      logInfo(`    Code: ${vuln.code}`);
    });
  }

  return vulnerabilities.length;
}

// Check CSP configuration
function checkCSPConfiguration() {
  logSection('Checking Content Security Policy');

  const cspFile = path.join(__dirname, 'static', 'security-headers.js');

  if (!fs.existsSync(cspFile)) {
    logError('CSP file not found!');
    return 1;
  }

  const content = fs.readFileSync(cspFile, 'utf8');

  // Check for unsafe-inline
  if (content.includes("'unsafe-inline'")) {
    logWarning('CSP contains unsafe-inline directive - this reduces XSS protection');
  } else {
    logSuccess('CSP does not contain unsafe-inline directive');
  }

  // Check for unsafe-eval
  if (content.includes("'unsafe-eval'")) {
    logError('CSP contains unsafe-eval directive - this is a security risk');
    return 1;
  } else {
    logSuccess('CSP does not contain unsafe-eval directive');
  }

  // Check for proper frame-ancestors
  if (content.includes("'frame-ancestors': ['self']")) {
    logSuccess('Frame-ancestors properly configured');
  } else {
    logWarning('Frame-ancestors configuration should be reviewed');
  }

  return 0;
}

// Check for hardcoded secrets
function checkForHardcodedSecrets() {
  logSection('Checking for Hardcoded Secrets');

  const srcDir = path.join(__dirname, 'src');
  const secrets = [];

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for API keys, tokens, passwords
        const secretPatterns = [
          /api[_-]?key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
          /token\s*[:=]\s*['"`][^'"`]+['"`]/gi,
          /password\s*[:=]\s*['"`][^'"`]+['"`]/gi,
          /secret\s*[:=]\s*['"`][^'"`]+['"`]/gi,
          /key\s*[:=]\s*['"`][^'"`]+['"`]/gi
        ];

        // Patterns to ignore (false positives)
        const ignorePatterns = [
          /key:\s*['"`][a-zA-Z_][a-zA-Z0-9_]*['"`]/g, // React keys
          /key\s*=\s*['"`][a-zA-Z_][a-zA-Z0-9_-]*['"`]/g, // Object keys
          /KEY\s*=\s*['"`][a-zA-Z_][a-zA-Z0-9_]*['"`]/g, // Constants
          /['"`]key['"`]\s*:/g, // Property names
          /:\s*['"`]key['"`]/g, // Property values
          /key\s*:\s*['"`][a-zA-Z_][a-zA-Z0-9_]*['"`]/g, // Object properties
          /key\s*=\s*['"`]auth_[a-zA-Z_][a-zA-Z0-9_]*['"`]/g, // Auth constants
          /key\s*=\s*['"`]closed['"`]/g, // Status values
          /key\s*=\s*`\$\{[^}]+\}`/g, // Template literals
          /key\s*=\s*['"`]open['"`]/g, // Status values
          /key\s*=\s*['"`]created_at['"`]/g, // Field names
          /key\s*=\s*['"`]signatures['"`]/g, // Field names
          /key\s*=\s*['"`]deadline['"`]/g, // Field names
          /key\s*=\s*['"`]blog['"`]/g, // Page names
          /key\s*=\s*['"`]campaigns['"`]/g, // Page names
          /key\s*=\s*['"`]polls['"`]/g, // Page names
          /key\s*=\s*['"`]signed['"`]/g, // Status values
          /key\s*=\s*['"`]unsigned['"`]/g, // Status values
          /key:\s*['"`]closed['"`]/g, // Object property with colon
          /key:\s*['"`]open['"`]/g, // Object property with colon
          /key:\s*['"`]created_at['"`]/g, // Object property with colon
          /key:\s*['"`]signatures['"`]/g, // Object property with colon
          /key:\s*['"`]deadline['"`]/g, // Object property with colon
          /key:\s*['"`]blog['"`]/g, // Object property with colon
          /key:\s*['"`]campaigns['"`]/g, // Object property with colon
          /key:\s*['"`]polls['"`]/g, // Object property with colon
          /key:\s*['"`]signed['"`]/g, // Object property with colon
          /key:\s*['"`]unsigned['"`]/g, // Object property with colon
          /const\s+key\s*=\s*`\$\{[^}]+\}`/g, // Template literal variables
          /TOKEN_KEY\s*=\s*['"`]auth_[a-zA-Z_][a-zA-Z0-9_]*['"`]/g, // Auth constants
          /EMAIL_KEY\s*=\s*['"`]auth_[a-zA-Z_][a-zA-Z0-9_]*['"`]/g, // Auth constants
          /ROLE_KEY\s*=\s*['"`]auth_[a-zA-Z_][a-zA-Z0-9_]*['"`]/g, // Auth constants
          /key\s*=\s*`\$\{[a-zA-Z_][a-zA-Z0-9_]*\}-[a-zA-Z_][a-zA-Z0-9_]*`/g, // Specific template literal pattern
          /key\s*=\s*`\$\{[a-zA-Z_][a-zA-Z0-9_]*\}-[a-zA-Z_][a-zA-Z0-9_]*`/g, // Template literal with dash
          /EMAIL_KEY\s*=\s*['"`]auth_email['"`]/g, // EMAIL_KEY constant
          /TOKEN_KEY\s*=\s*['"`]auth_token['"`]/g, // TOKEN_KEY constant
          /ROLE_KEY\s*=\s*['"`]auth_role['"`]/g, // ROLE_KEY constant
          /const\s+key\s*=\s*`\$\{[a-zA-Z_][a-zA-Z0-9_]*\}-\$\{[a-zA-Z_][a-zA-Z0-9_]*\}`/g, // Template literal with variables
          /private\s+static\s+readonly\s+EMAIL_KEY\s*=\s*['"`]auth_email['"`]/g, // Private static readonly EMAIL_KEY
          /private\s+static\s+readonly\s+TOKEN_KEY\s*=\s*['"`]auth_token['"`]/g, // Private static readonly TOKEN_KEY
          /private\s+static\s+readonly\s+ROLE_KEY\s*=\s*['"`]auth_role['"`]/g, // Private static readonly ROLE_KEY
          /key\s*=\s*`\$\{[a-zA-Z_][a-zA-Z0-9_]*\}-\$\{[a-zA-Z_][a-zA-Z0-9_]*\}`/g, // Template literal with variables (exact match)
          /EMAIL_KEY\s*=\s*['"`]auth_email['"`]/g, // EMAIL_KEY constant (exact match)
          /TOKEN_KEY\s*=\s*['"`]auth_token['"`]/g, // TOKEN_KEY constant (exact match)
          /ROLE_KEY\s*=\s*['"`]auth_role['"`]/g, // ROLE_KEY constant (exact match)
          /[A-Z_]+_KEY\s*=\s*['"`]auth_[a-zA-Z_][a-zA-Z0-9_]*['"`]/g, // Any _KEY constant with auth_ prefix
          /[A-Z_]*KEY\s*=\s*['"`]auth_[a-zA-Z_][a-zA-Z0-9_]*['"`]/g, // Any KEY constant with auth_ prefix (including EMAIL_KEY)
        ];

        secretPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              // Check if this match should be ignored
              const shouldIgnore = ignorePatterns.some(ignorePattern =>
                ignorePattern.test(match)
              );

              if (!shouldIgnore) {
                const lineNumber = content.indexOf(match);
                const line = content.substring(0, lineNumber).split('\n').length;
                secrets.push({
                  file: path.relative(__dirname, filePath),
                  line: line,
                  issue: 'Potential hardcoded secret found',
                  code: match.trim()
                });
              }
            });
          }
        });
      }
    }
  }

  scanDirectory(srcDir);

  if (secrets.length === 0) {
    logSuccess('No hardcoded secrets found!');
  } else {
    logWarning(`${secrets.length} potential hardcoded secrets found:`);
    secrets.forEach(secret => {
      logWarning(`  ${secret.file}:${secret.line} - ${secret.issue}`);
      logInfo(`    Code: ${secret.code}`);
    });
  }

  return secrets.length;
}

// Check dependencies for known vulnerabilities
function checkDependencies() {
  logSection('Checking Dependencies for Vulnerabilities');

  try {
    // Check if npm audit is available
    const auditResult = execSync('npm audit --json', { cwd: __dirname, encoding: 'utf8' });
    const audit = JSON.parse(auditResult);

    if (audit.metadata.vulnerabilities.total === 0) {
      logSuccess('No vulnerable dependencies found!');
      return 0;
    } else {
      logError(`${audit.metadata.vulnerabilities.total} vulnerabilities found in dependencies:`);

      Object.keys(audit.vulnerabilities).forEach(pkg => {
        const vuln = audit.vulnerabilities[pkg];
        logError(`  ${pkg}@${vuln.version} - ${vuln.title}`);
        logInfo(`    Severity: ${vuln.severity}`);
        logInfo(`    Recommendation: ${vuln.recommendation}`);
      });

      return audit.metadata.vulnerabilities.total;
    }
  } catch (error) {
    logWarning('Could not run npm audit. Make sure you have npm installed and run "npm audit" manually.');
    return 0;
  }
}

// Check for security headers
function checkSecurityHeaders() {
  logSection('Checking Security Headers Configuration');

  const headersFile = path.join(__dirname, 'static', 'security-headers.js');

  if (!fs.existsSync(headersFile)) {
    logError('Security headers file not found!');
    return 1;
  }

  const content = fs.readFileSync(headersFile, 'utf8');

  const requiredHeaders = [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy'
  ];

  let missingHeaders = 0;

  requiredHeaders.forEach(header => {
    if (content.includes(header)) {
      logSuccess(`${header} header is configured`);
    } else {
      logWarning(`${header} header is missing`);
      missingHeaders++;
    }
  });

  return missingHeaders;
}

// Main audit function
function runSecurityAudit() {
  log(`${colors.bold}${colors.blue}🔒 Security Audit for Senfi Web Application${colors.reset}\n`);

  let totalIssues = 0;

  totalIssues += scanForXSSVulnerabilities();
  totalIssues += checkCSPConfiguration();
  totalIssues += checkForHardcodedSecrets();
  totalIssues += checkDependencies();
  totalIssues += checkSecurityHeaders();

  logSection('Audit Summary');

  if (totalIssues === 0) {
    logSuccess('🎉 No security issues found! Your application appears to be secure.');
  } else {
    logError(`⚠️  ${totalIssues} security issues found. Please review and fix them.`);
    logInfo('Recommendations:');
    logInfo('  1. Fix XSS vulnerabilities by using sanitizeHTML() function');
    logInfo('  2. Remove unsafe-inline from CSP if possible');
    logInfo('  3. Move secrets to environment variables');
    logInfo('  4. Update vulnerable dependencies');
    logInfo('  5. Configure missing security headers');
  }

  return totalIssues;
}

// Run the audit if this script is executed directly
if (require.main === module) {
  const exitCode = runSecurityAudit();
  process.exit(exitCode > 0 ? 1 : 0);
}

module.exports = {
  runSecurityAudit,
  scanForXSSVulnerabilities,
  checkCSPConfiguration,
  checkForHardcodedSecrets,
  checkDependencies,
  checkSecurityHeaders
}; 