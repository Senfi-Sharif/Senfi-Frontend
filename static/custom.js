if (typeof window !== 'undefined' && typeof window.gtag !== 'function') {
  window.gtag = function() {};
}

// Remove the external link SVG that Docusaurus injects - PREVENT FLASH
(function() {
  function removeExternalLinkSVG() {
    // Remove the main SVG element
    const svgElement = document.querySelector('svg[style="display: none;"]');
    if (svgElement) {
      svgElement.remove();
    }
    
    // Remove any external link icons
    const externalLinkIcons = document.querySelectorAll('.iconExternalLink_nPIU, svg[class*="iconExternalLink"]');
    externalLinkIcons.forEach(icon => icon.remove());
    
    // Hide any remaining SVGs with external link content
    const svgsWithExternalLink = document.querySelectorAll('svg:has(use[href="#theme-svg-external-link"]), svg:has(symbol[id="theme-svg-external-link"])');
    svgsWithExternalLink.forEach(svg => {
      svg.style.display = 'none';
      svg.style.visibility = 'hidden';
      svg.style.opacity = '0';
      svg.style.position = 'absolute';
      svg.style.left = '-9999px';
      svg.style.top = '-9999px';
      svg.style.width = '0';
      svg.style.height = '0';
      svg.style.overflow = 'hidden';
      svg.style.pointerEvents = 'none';
    });
  }
  
  // Try to remove immediately and also after delays to ensure DOM is ready
  removeExternalLinkSVG();
  
  // Run immediately when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeExternalLinkSVG);
  }
  
  // Also run after window load
  window.addEventListener('load', removeExternalLinkSVG);
  
  // Multiple timeouts to catch it at different stages
  setTimeout(removeExternalLinkSVG, 50);
  setTimeout(removeExternalLinkSVG, 100);
  setTimeout(removeExternalLinkSVG, 200);
  setTimeout(removeExternalLinkSVG, 500);
  setTimeout(removeExternalLinkSVG, 1000);
  setTimeout(removeExternalLinkSVG, 2000);
  
  // Also listen for DOM changes
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          removeExternalLinkSVG();
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})(); 