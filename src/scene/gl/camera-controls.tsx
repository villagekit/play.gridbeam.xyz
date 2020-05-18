import type CameraControlsType from 'camera-controls'
import React, { forwardRef, useEffect, useRef } from 'react'
import type { ReactThreeFiber } from 'react-three-fiber'
import { extend, useFrame, useThree } from 'react-three-fiber'
import * as THREE from 'three'
import { useMergeRefs } from 'use-callback-ref'

// https://github.com/react-spring/drei/blob/master/src/OrbitControls.tsx

const CameraControlsImpl =
  typeof window !== 'undefined' ? require('camera-controls').default : null

if (CameraControlsImpl != null) {
  CameraControlsImpl.install({ THREE })

  extend({ CameraControlsImpl })
}

type CameraControlsProps = ReactThreeFiber.Object3DNode<
  CameraControlsType,
  typeof CameraControlsImpl
>

declare global {
  namespace JSX {
    interface IntrinsicElements {
      cameraControlsImpl: CameraControlsProps
    }
  }
}

export const GlCameraControls = forwardRef<
  CameraControlsType,
  CameraControlsProps
>((props, ref) => {
  const controlsRef = useRef<CameraControlsType>(null)

  const { camera, gl, invalidate } = useThree()

  useFrame((_, delta) => controlsRef.current?.update(delta))

  useEffect(() => {
    const controls = controlsRef.current
    controls?.addEventListener('change', invalidate)
    return () => controls?.removeEventListener('change', invalidate)
  }, [invalidate])

  return (
    <cameraControlsImpl
      ref={useMergeRefs<CameraControlsType>([controlsRef, ref])}
      args={[camera, gl.domElement]}
      {...props}
    />
  )
})
