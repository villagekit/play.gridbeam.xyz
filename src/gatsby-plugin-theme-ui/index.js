import baseTheme from '@theme-ui/preset-base'

const colors = {
  ...baseTheme.colors,
  primary: '#462E74',
  secondary: ['#6E9B34', '#AA7439'],
  // prev:
  // - http://paletton.com/#uid=54m0X0kllllaFw0g0qFqFg0w0aF
  /*
  primary: ['#8C7AAE', '#665091', '#462E74', '#2C1657', '#18063A'],
  secondary: [
    ['#D991AF', '#B55B81', '#913059', '#6D1238', '#48001E'],
    ['#6D92A0', '#457485', '#27586B', '#103E50', '#022735']
  ],
  */
  // - http://paletton.com/#uid=34t0X0kllllaFw0g0qFqFg0w0aF
  success: '#28a745',
  info: '#17a2b8',
  warning: '#ffc107',
  danger: '#dc3545',
  white: '#fff',
  light: '#f8f9fa',
  muted: '#6c757d',
  dark: '#343a40',
}

const fonts = {
  ...baseTheme.fonts,
  headline: 'Bungee',
  sans: 'IBM Plex Sans',
  serif: 'IBM Plex Serif',
}
fonts.heading = fonts.sans
fonts.body = fonts.serif

export default {
  ...baseTheme,
  colors,
  fonts,
  sizes: baseTheme.space,
}
