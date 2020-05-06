import React from 'react'
import { useUpdate } from 'react-three-fiber'
import { Geometry as GeometryComponent } from 'react-three-fiber/components'
import { Face3, Geometry, Vector3 } from 'three'

export default SimplicialComplexGeometry

interface SimplicialComplex {
  positions: Array<[number, number, number]>
  cells: Array<[number, number, number]>
}

interface SimplicialComplexGeometryProps
  extends React.ComponentProps<typeof GeometryComponent> {
  simplicialComplex: SimplicialComplex
}

function SimplicialComplexGeometry(props: SimplicialComplexGeometryProps) {
  const { simplicialComplex, attach } = props
  const { positions, cells } = simplicialComplex

  const ref = useUpdate(
    (geometry: Geometry) => {
      updatePositions(geometry, positions)
      updateCells(geometry, cells, positions)
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()
      geometry.computeFaceNormals()
      geometry.computeMorphNormals()
      geometry.computeVertexNormals()
    },
    [simplicialComplex],
  )

  return <geometry attach={attach} ref={ref} />
}

function updatePositions(
  geometry: Geometry,
  positions: SimplicialComplex['positions'],
) {
  geometry.vertices = positions.map((pos) => new Vector3().fromArray(pos))
  geometry.verticesNeedUpdate = true
}

function updateCells(
  geometry: Geometry,
  cells: SimplicialComplex['cells'],
  positions: SimplicialComplex['positions'],
) {
  geometry.faces = cells.map((cell, index) => {
    return new Face3(cell[0], cell[1], cell[2])
  })
  geometry.elementsNeedUpdate = true
}
