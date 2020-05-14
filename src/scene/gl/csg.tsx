import csgToSimplicialComplex from 'csg-to-mesh'
import React, { useMemo } from 'react'
import { Geometry } from 'react-three-fiber/components'

import { GlSimplicialComplexGeometry } from './complex'

interface CsgGeometryProps extends React.ComponentProps<typeof Geometry> {
  csg: any
}

export function GlCsgGeometry(props: CsgGeometryProps) {
  const { csg, ...forwardProps } = props

  const simplicialComplex = useMemo(() => {
    return csgToSimplicialComplex(csg)
  }, [csg])

  return (
    <GlSimplicialComplexGeometry
      simplicialComplex={simplicialComplex}
      {...forwardProps}
    />
  )
}
