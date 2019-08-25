const React = require('react')
const THREE = require('three')
const { useUpdate } = require('react-three-fiber')

module.exports = SimplicialComplexGeometry

function SimplicialComplexGeometry (props) {
  const { mesh, attach } = props
  const { positions, cells } = mesh

  const ref = useUpdate(
    geometry => {
      updatePositions(geometry, positions)
      updateCells(geometry, cells, positions)
      geometry.computeFaceNormals()
      geometry.computeVertexNormals()
      geometry.computeBoundingSphere()
    },
    [mesh]
  )

  return <geometry attach={attach} ref={ref} />
}

function updatePositions (geometry, positions) {
  geometry.vertices = positions.map(pos => new THREE.Vector3().fromArray(pos))
  geometry.verticesNeedUpdate = true
}

function updateCells (geometry, cells, positions) {
  geometry.faces = cells.map((cell, index) => {
    return new THREE.Face3(cell[0], cell[1], cell[2])
  })
  geometry.elementsNeedUpdate = true
}
