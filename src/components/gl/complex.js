import React from 'react'
import { useUpdate } from 'react-three-fiber'
import { Face3, Vector3 } from 'three'

export default SimplicialComplexGeometry

function SimplicialComplexGeometry(props) {
  const { simplicialComplex, attach } = props
  const { positions, cells } = simplicialComplex

  const ref = useUpdate(
    (geometry) => {
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

function updatePositions(geometry, positions) {
  geometry.vertices = positions.map((pos) => new Vector3().fromArray(pos))
  geometry.verticesNeedUpdate = true
}

function updateCells(geometry, cells, positions) {
  geometry.faces = cells.map((cell, index) => {
    return new Face3(cell[0], cell[1], cell[2])
  })
  geometry.elementsNeedUpdate = true
}
