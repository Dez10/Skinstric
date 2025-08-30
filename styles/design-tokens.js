// Design Tokens from Figma Export
// Update these values based on your Figma design system

export const designTokens = {
  // Colors (get these from Figma color styles)
  colors: {
    primary: '#000000',
    secondary: '#ffffff', 
    accent: '#007bff',
    background: '#ffffff',
    text: {
      primary: '#000000',
      secondary: '#666666',
      muted: '#999999'
    },
    border: '#e5e5e5',
    error: '#dc3545',
    success: '#28a745'
  },

  // Typography (get these from Figma text styles)
  typography: xfontFamily: {*{---------------------,$% Inter, sans-serif',
      secondary: 'Arial, s5,8N 
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '40px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8
    }
  },

  // Spacing (get these from Figma spacing tokens)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '80px'
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};

// Helper function to use tokens in components
export const useDesignToken = (path) => {
  return path.split('.').reduce((obj, key) => obj[key], designTokens);
};
