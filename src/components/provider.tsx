import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'

import createStore from '../store'

const store = createStore()

interface ProviderProps {
  children: React.ReactNode
}

export const DomProvider = ({ children }: ProviderProps) => (
  <ReduxProvider store={store}>{children}</ReduxProvider>
)

export default DomProvider

export const GlProvider = DomProvider