import csgToSimplicialComplex from 'csg-to-mesh'
import React, { useMemo } from 'react'
import { Geometry } from 'react-three-fiber/components'

import SimplicialComplexGeometry from './complex'

export default CsgGeometry

interface CsgGeometryProps extends React.ComponentProps<typeof Geometry> {
  csg: any
}

function CsgGeometry(props: CsgGeometryProps) {
  const { csg, ...forwardProps } = props

  const simplicialComplex = useMemo(() => {
    return csgToSimplicialComplex(csg)
  }, [csg])

  return (
    <SimplicialComplexGeometry
      simplicialComplex={simplicialComplex}
      {...forwardProps}
    />
  )
}
