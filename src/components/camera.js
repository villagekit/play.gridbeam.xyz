import React from 'react'
import { Box3, Vector3 } from 'three'
import { extend, useThree, useFrame } from 'react-three-fiber'
import { useStore, useSelector } from 'react-redux'
import { map, prop } from 'ramda'

import OrbitControls from '../vendor/OrbitControls'

extend({ OrbitControls })

export default Camera

function Camera (props) {
  const controlsRef = React.useRef()
  const { camera, scene } = useThree()

  const { select } = useStore()
  const isControlEnabled = useSelector(select.camera.isControlEnabled)
  const parts = useSelector(select.parts.all)
  const selectedParts = useSelector(select.parts.selected)
  const isMoving = useSelector(select.parts.isMoving)
  const isSelecting = useSelector(select.selection.isSelecting)

  React.useEffect(() => {
    const controls = controlsRef.current
    camera.far = 100000
    camera.position.set(10000, 0, 0)
    controls.rotateLeft(-Math.PI / 32)
    controls.rotateUp(Math.PI / 64)
    camera.zoom = 0.5
    camera.updateProjectionMatrix()
    controls.update()
  }, [])

  useFrame(() => {
    if (controlsRef.current) controlsRef.current.update()
  })

  // center camera on parts
  // TODO: create a center object with right-click
  // - move it around to change the center
  // - removing the center goes back to the default behavior
  React.useEffect(() => {
    if (isMoving || isSelecting) return

    let centeredParts = parts
    if (selectedParts.length > 0) {
      centeredParts = selectedParts
    }
    if (centeredParts.length === 0) {
      new Vector3(0, 0, 0).copy(controlsRef.current.target)
      return
    }
    const uuids = map(prop('uuid'), centeredParts)
    const box = compute3dBounds(scene, uuids)
    box.getCenter(controlsRef.current.target)
  }, [isMoving, scene, parts, selectedParts])

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera]}
      enabled={isControlEnabled}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.1}
    />
  )
}

function compute3dBounds (scene, uuids) {
  var box = new Box3()

  uuids.forEach(uuid => {
    const mesh = scene.getObjectByName(uuid)
    if (mesh != null) box.expandByObject(mesh)
  })

  return box
}
