import React from 'react'
import { Vector3, Face3 } from 'three'
import { useUpdate } from 'react-three-fiber'

export default SimplicialComplexGeometry

function SimplicialComplexGeometry (props) {
  const { mesh, attach } = props
  const { positions, cells } = mesh

  const ref = useUpdate(geometry => {
    updatePositions(geometry, positions)
    updateCells(geometry, cells, positions)
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    geometry.computeFaceNormals()
    geometry.computeMorphNormals()
    geometry.computeVertexNormals()
  }, [mesh])

  return <geometry attach={attach} ref={ref} />
}

function updatePositions (geometry, positions) {
  geometry.vertices = positions.map(pos => new Vector3().fromArray(pos))
  geometry.verticesNeedUpdate = true
}

function updateCells (geometry, cells, positions) {
  geometry.faces = cells.map((cell, index) => {
    return new Face3(cell[0], cell[1], cell[2])
  })
  geometry.elementsNeedUpdate = true
}
