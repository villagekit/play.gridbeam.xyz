import 'pepjs'

import React from 'react'
import { Object3D, Vector3 } from 'three'

import { DomProvider } from './src'

export const wrapRootElement = ({ element }) => (
  <DomProvider>{element}</DomProvider>
)

Object3D.DefaultUp = new Vector3(0, 0, 1)
