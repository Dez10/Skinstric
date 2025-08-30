// Asset management utility for Figma exports
// This helps organize and use your exported assets consistently

export const assets = {
  // Icons
  icons: {
    camera: '/images/icons/camera-icon.svg',
    cameraPng: '/images/icons/camera-icon.png',
    gallery: '/images/icons/gallery-icon.svg',
    galleryPng: '/images/icons/gallery-icon.png',
    diamond: '/images/ui-elements/diamond-icon.svg',
    leftBracket: '/images/icons/left-bracket.svg',
    leftBracketPng: '/images/icons/left-bracket.png',
    rightBracket: '/images/icons/right-bracket.svg',
    rightBracketPng: '/images/icons/right-bracket.png',
    // Add more icons as you export them from Figma
  },

  // UI Elements
  diamonds: {
    lightLarge: '/images/ui-elements/diamond-light-large.png',
    medium: '/images/ui-elements/diamond-medium.png',
    icon: '/images/ui-elements/diamond-icon.svg'
  },

  // Backgrounds
  backgrounds: {
    // Add background images exported from Figma
  }
};

// Helper component for consistent image usage
export const AssetImage = ({ src, alt, className, ...props }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      loading="lazy"
      {...props}
    />
  );
};

// Helper for getting asset paths
export const getAsset = (category, name) => {
  return assets[category]?.[name] || '';
};
