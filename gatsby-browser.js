import 'pepjs'

import React from 'react'
import { Object3D, Vector3 } from 'three'

import Provider from './src/app/components/provider'

export const wrapRootElement = ({ element }) => <Provider>{element}</Provider>

Object3D.DefaultUp = new Vector3(0, 0, 1)
