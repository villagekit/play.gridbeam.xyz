import React from 'react'
import { extend, useThree, useRender } from 'react-three-fiber'
import { useStore, useSelector } from 'react-redux'

import OrbitControls from '../vendor/OrbitControls'

extend({ OrbitControls })

export default Camera

function Camera (props) {
  const controlsRef = React.useRef()
  const { camera } = useThree()

  const { select } = useStore()
  const isControlEnabled = useSelector(select.camera.isControlEnabled)

  React.useEffect(() => {
    const controls = controlsRef.current
    camera.far = 10000
    camera.position.set(5000, 0, 0)
    controls.rotateLeft(-Math.PI / 32)
    controls.rotateUp(Math.PI / 64)
    camera.zoom = 1
    camera.updateProjectionMatrix()
    controls.update()
  }, [])

  useRender(() => {
    controlsRef.current.update()
  })

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
