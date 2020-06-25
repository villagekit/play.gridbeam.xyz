/** @jsx jsx */
import React, { useEffect, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { AppStore, createStore } from 'src'
import { jsx } from 'theme-ui'

interface DomProviderProps {
  children: React.ReactNode
}

export const DomProvider = ({ children }: DomProviderProps) => {
  const [store, setStore] = useState<AppStore>()

  useEffect(() => setStore(createStore()), [])

  if (store == null) return null

  return <ReduxProvider store={store}>{children}</ReduxProvider>
}
