import React, { useMemo } from 'react'
import { useUpdate } from 'react-three-fiber'
import { Group as GroupComponent, Line } from 'react-three-fiber/components'
import {
  BufferGeometry,
  Color,
  CylinderBufferGeometry,
  Float32BufferAttribute,
  Group,
  Vector3,
} from 'three'
import quaternionFromNormal from 'three-quaternion-from-normal'

interface ArrowProps extends React.ComponentProps<typeof GroupComponent> {
  direction?: [number, number, number] | Vector3
  origin?: [number, number, number] | Vector3
  color?: string | Color
  length?: number
  headLength?: number
  headWidth?: number
}

export function GlArrow(props: ArrowProps) {
  const {
    direction = new Vector3(0, 0, 1),
    origin = new Vector3(0, 0, 0),
    color = 0xffff00,
    length = 1,
    headLength = 0.2 * length,
    headWidth = 0.2 * headLength,
    ...containerProps
  } = props

  const arrowRef = useUpdate<Group>(
    (group) => {
      const dir =
        direction instanceof Vector3
          ? direction
          : new Vector3().fromArray(direction)
      const quaternion = quaternionFromNormal(dir)
      group.quaternion.copy(quaternion)
    },
    [direction],
  )

  const lineGeometryRef = useUpdate<BufferGeometry>((geometry) => {
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3),
    )
  }, [])
  const lineScale: [number, number, number] = useMemo(() => {
    return [1, Math.max(0.0001, length - headLength), 1]
  }, [headLength, length])

  const coneGeometryRef = useUpdate<CylinderBufferGeometry>((geometry) => {
    geometry.translate(0, -0.5, 0)
  }, [])
  const coneScale: [number, number, number] = useMemo(() => {
    return [headWidth, headLength, headWidth]
  }, [headWidth, headLength])
  const conePosition: [number, number, number] = useMemo(() => [0, length, 0], [
    length,
  ])

  return (
    <group name="arrow" {...containerProps}>
      <group ref={arrowRef} position={origin}>
        <Line scale={lineScale}>
          <bufferGeometry attach="geometry" ref={lineGeometryRef} />
          <lineBasicMaterial
            attach="material"
            color={color}
            toneMapped={false}
          />
        </Line>
        <mesh position={conePosition} scale={coneScale}>
          <cylinderBufferGeometry
            attach="geometry"
            ref={coneGeometryRef}
            args={[0, 0.5, 1, 5, 1]}
          />
          <meshBasicMaterial
            attach="material"
            color={color}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  )
}
