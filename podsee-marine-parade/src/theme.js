import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2c4a3a', // Dark green from design
      dark: '#1f3a0f',
      light: '#3d7a66',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d4c4b0', // Darker brown pastel for selected states
      light: '#e0d4c4',
      dark: '#c0b0a0',
    },
    background: {
      default: '#f5f1e8', // Cream background
      paper: '#f8f5ef', // Very light tan for unselected
    },
    text: {
      primary: '#3d3d3d', // Dark gray for headings
      secondary: '#888888', // Gray for body text
      disabled: '#999999',
    },
    divider: '#4a90e2',
    error: {
      main: '#d32f2f',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Strong headline
    h1: {
      fontSize: '28px',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontSize: '22px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    // Muted subtitle
    subtitle1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#666666',
    },
    subtitle2: {
      fontSize: '15px',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#666666',
    },
    body1: {
      fontSize: '16px',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '14px',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '16px',
      fontWeight: 600,
      textTransform: 'none', // No uppercase for buttons
      letterSpacing: '0.5px',
    },
  },
  shape: {
    borderRadius: 28, // Soft rounded corners for pill-shaped elements
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)', // Subtle shadow
    '0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 3px 6px rgba(0, 0, 0, 0.07)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 5px 10px rgba(0, 0, 0, 0.09)',
    '0px 6px 12px rgba(0, 0, 0, 0.1)',
    '0px 7px 14px rgba(0, 0, 0, 0.11)',
    '0px 8px 16px rgba(0, 0, 0, 0.12)',
    '0px 9px 18px rgba(0, 0, 0, 0.13)',
    '0px 10px 20px rgba(0, 0, 0, 0.14)',
    '0px 11px 22px rgba(0, 0, 0, 0.15)',
    '0px 12px 24px rgba(0, 0, 0, 0.16)',
    '0px 13px 26px rgba(0, 0, 0, 0.17)',
    '0px 14px 28px rgba(0, 0, 0, 0.18)',
    '0px 15px 30px rgba(0, 0, 0, 0.19)',
    '0px 16px 32px rgba(0, 0, 0, 0.2)',
    '0px 17px 34px rgba(0, 0, 0, 0.21)',
    '0px 18px 36px rgba(0, 0, 0, 0.22)',
    '0px 19px 38px rgba(0, 0, 0, 0.23)',
    '0px 20px 40px rgba(0, 0, 0, 0.24)',
    '0px 21px 42px rgba(0, 0, 0, 0.25)',
    '0px 22px 44px rgba(0, 0, 0, 0.26)',
    '0px 23px 46px rgba(0, 0, 0, 0.27)',
    '0px 24px 48px rgba(0, 0, 0, 0.28)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28, // Pill-shaped buttons
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '18px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20, // Rounded chips
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 28, // Pill-shaped input fields
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: '#d0c4a8',
              transition: 'border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '&:hover fieldset': {
              borderColor: '#2c5f4f',
            },
          },
        },
      },
    },
    MuiCollapse: {
      styleOverrides: {
        root: {
          // Smooth expand/collapse animations with Material 3 easing
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
  },
  spacing: 8, // Material Design spacing unit (8px)
})

export default theme
