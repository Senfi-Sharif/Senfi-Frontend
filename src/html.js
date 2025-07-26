import { sanitizeHTML } from 'utils/security';
export default function Html(props) {
  return (
    <html {...props.htmlAttributes} >
      <head {...props.headAttributes}>
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && typeof window.gtag !== 'function') {
              window.gtag = function() {};
            }
            
            // Initialize theme from localStorage
            (function() {
              try {
                var savedTheme = localStorage.getItem('theme');
                if (savedTheme) {
                  document.documentElement.setAttribute('data-theme', savedTheme);
                }
              } catch (e) {
                // Fallback silently
              }
            })();
          `
        }} />
        {props.headTags}
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyTags}
        <div id="__docusaurus">{props.children}</div>
        {props.postBodyTags}

      </body>
    </html>
  );
} 