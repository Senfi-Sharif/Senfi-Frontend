/**
 * Custom ESLint plugin to enforce sanitizeHTML usage with dangerouslySetInnerHTML
 */

module.exports = {
  rules: {
    'require-sanitize-html': {
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.name === 'dangerouslySetInnerHTML') {
              // Check if sanitizeHTML is imported
              const sourceCode = context.getSourceCode();
              const importDeclarations = sourceCode.ast.body.filter(
                node => node.type === 'ImportDeclaration'
              );
              
              let hasSanitizeImport = false;
              for (const importDecl of importDeclarations) {
                if (importDecl.source.value.includes('security')) {
                  const specifiers = importDecl.specifiers || [];
                  for (const specifier of specifiers) {
                    if (specifier.type === 'ImportSpecifier' && 
                        specifier.imported.name === 'sanitizeHTML') {
                      hasSanitizeImport = true;
                      break;
                    }
                  }
                }
              }
              
              if (!hasSanitizeImport) {
                context.report({
                  node,
                  message: 'dangerouslySetInnerHTML requires sanitizeHTML import. Please import { sanitizeHTML } from "../utils/security"',
                  fix(fixer) {
                    // Find the first import statement to add our import after it
                    const firstImport = sourceCode.ast.body.find(
                      node => node.type === 'ImportDeclaration'
                    );
                    
                    if (firstImport) {
                      // Add import after the first import statement
                      return fixer.insertTextAfter(
                        firstImport,
                        '\nimport { sanitizeHTML } from \'../utils/security\';'
                      );
                    } else {
                      // Add import at the beginning of the file
                      return fixer.insertTextBefore(
                        sourceCode.ast.body[0],
                        'import { sanitizeHTML } from \'../utils/security\';\n'
                      );
                    }
                  }
                });
              }
              
              // Check if sanitizeHTML is actually used in the dangerouslySetInnerHTML
              const jsxExpression = node.value.expression;
              if (jsxExpression && jsxExpression.type === 'ObjectExpression') {
                const htmlProperty = jsxExpression.properties.find(
                  prop => prop.key.name === '__html'
                );
                
                if (htmlProperty) {
                  const htmlValue = htmlProperty.value;
                  if (htmlValue.type === 'Identifier' || 
                      (htmlValue.type === 'MemberExpression' && !htmlValue.callee)) {
                    // Check if sanitizeHTML is called
                    const htmlText = sourceCode.getText(htmlValue);
                    if (!htmlText.includes('sanitizeHTML(')) {
                      context.report({
                        node,
                        message: 'dangerouslySetInnerHTML content must be sanitized using sanitizeHTML()',
                        fix(fixer) {
                          return fixer.replaceText(
                            htmlValue,
                            `sanitizeHTML(${htmlText})`
                          );
                        }
                      });
                    }
                  }
                }
              }
            }
          }
        };
      }
    }
  }
}; 