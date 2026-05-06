import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
}

export function SEO({ 
  title, 
  description = "Save up to 75% on premium subscriptions by sharing slots securely on SubPool. The #1 trusted subscription pooling network.",
  canonical,
  ogType = "website",
  ogImage = "/og-image.png"
}: SEOProps) {
  const fullTitle = `${title} | SubPool — Secure Subscription Pooling`;

  useEffect(() => {
    document.title = fullTitle;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update OG tags
    const updateOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOgTag('og:title', fullTitle);
    updateOgTag('og:description', description);
    updateOgTag('og:type', ogType);
    updateOgTag('og:image', ogImage);
    updateOgTag('og:site_name', 'SubPool');

    // Canonical link
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }
  }, [fullTitle, description, ogType, ogImage, canonical]);

  return null;
}
