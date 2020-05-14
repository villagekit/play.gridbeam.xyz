import React from 'react'

import { DomProvider } from './src'

export const wrapRootElement = ({ element }) => (
  <DomProvider>{element}</DomProvider>
)
