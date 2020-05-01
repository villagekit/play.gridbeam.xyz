import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'

import createStore from '../store'

const store = createStore()

export const DomProvider = ({ children }) => (
  <ReduxProvider store={store}>{children}</ReduxProvider>
)

export default DomProvider

export const GlProvider = DomProvider
