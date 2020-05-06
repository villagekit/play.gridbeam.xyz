import { map } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { extend, useFrame, useThree } from 'react-three-fiber'
import { Box3, Scene, Vector3 } from 'three'

import {
  getAnyPartIsMoving,
  getIsCameraControlEnabled,
  getIsSelecting,
  getParts,
  getSelectedParts,
  Uuid,
} from '../../store'
import OrbitControls from '../../vendor/OrbitControls'

extend({ OrbitControls })

export default Camera

interface CameraProps {}

function Camera(props: CameraProps) {
  const controlsRef = React.useRef<any>()
  const { camera, scene } = useThree()

  const isControlEnabled = useSelector(getIsCameraControlEnabled)
  const parts = useSelector(getParts)
  const selectedParts = useSelector(getSelectedParts)
  const isMoving = useSelector(getAnyPartIsMoving)
  const isSelecting = useSelector(getIsSelecting)

  React.useEffect(() => {
    const controls = controlsRef.current
    if (controls == null) return
    camera.far = 100000
    camera.position.set(10000, 0, 0)
    controls.rotateLeft(-Math.PI / 32)
    controls.rotateUp(Math.PI / 64)
    camera.zoom = 0.5
    camera.updateProjectionMatrix()
    controls.update()
  }, [camera])

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
    const uuids = map(centeredParts, 'uuid')
    const box = compute3dBounds(scene, uuids)
    box.getCenter(controlsRef.current.target)
  }, [isMoving, scene, parts, selectedParts, isSelecting])

  return (
    // @ts-ignore
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

function compute3dBounds(scene: Scene, uuids: Array<Uuid>) {
  const box = new Box3()

  uuids.forEach((uuid) => {
    const mesh = scene.getObjectByName(uuid)
    if (mesh != null) box.expandByObject(mesh)
  })

  return box
}
