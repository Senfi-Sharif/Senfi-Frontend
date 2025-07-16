export default function Html(props) {
  return (
    <html {...props.htmlAttributes}>
      <head {...props.headAttributes}>
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && typeof window.gtag !== 'function') {
              window.gtag = function() {};
            }
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