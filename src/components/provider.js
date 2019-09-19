import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import store from '../store'
import theme from '../theme'

export const DomProvider = ({ children }) => (
  <ReduxProvider store={store}>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </ReduxProvider>
)

export default DomProvider

export const GlProvider = ({ children }) => (
  <ReduxProvider store={store}>{children}</ReduxProvider>
)
