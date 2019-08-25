const React = require('react')
const { extend, useThree, useRender } = require('react-three-fiber')
const OrbitControls = require('../vendor/OrbitControls')

const useCameraStore = require('../stores/camera').default

extend({ OrbitControls })

module.exports = Camera

function Camera (props) {
  const controlsRef = React.useRef()
  const { camera } = useThree()

  const controlEnabled = useCameraStore(state => state.controlEnabled)

  React.useEffect(() => {
    const controls = controlsRef.current
    camera.far = 10000
    camera.position.set(0, 0, 1000)
    controls.rotateLeft(-Math.PI / 32)
    controls.rotateUp(Math.PI / 64)
    camera.zoom = 2.5
    controls.update()
  }, [])

  useRender(() => {
    controlsRef.current.update()
  })

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera]}
      enabled={controlEnabled}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.1}
    />
  )
}
