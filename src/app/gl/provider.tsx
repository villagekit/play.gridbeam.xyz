/** @jsx jsx */
import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { AppStore } from 'src'
import { jsx } from 'theme-ui'

// `react-three-fiber` `<Canvas />` does not pass down React context:
//    https://github.com/react-spring/react-three-fiber/issues/262
//    so we need to manually pass down Redux store.

interface GlProviderProps {
  store: AppStore
  children: React.ReactNode
}

export const GlProvider = ({ store, children }: GlProviderProps) => {
  return <ReduxProvider store={store}>{children}</ReduxProvider>
}
