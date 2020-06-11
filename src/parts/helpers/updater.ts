// declarative part updates

import { PartEntity, Uuid } from '../store'

type PartState = PartEntity

export enum LengthDirection {
  positive = 'positive',
  negative = 'negative',
}

export interface MoveUpdate {
  type: 'move'
  payload: {
    delta: [number, number, number]
  }
}

function moveUpdate(part: PartState, update: MoveUpdate) {
  const { delta } = update.payload

  part.origin.x += delta[0]
  part.origin.y += delta[1]
  part.origin.z += delta[2]
}

export interface ScaleUpdate {
  type: 'scale'
  payload: {
    delta: number
    lengthDirection: LengthDirection
  }
}

function scaleUpdate(part: PartState, update: ScaleUpdate) {
  let { delta, lengthDirection } = update.payload

  // special case: length must not go below zero
  if (part.length + delta < 1) {
    delta = -part.length + 1
  }

  if (lengthDirection === LengthDirection.positive) {
    part.length += delta
  } else if (lengthDirection === LengthDirection.negative) {
    const moveX = delta * part.direction.x
    const moveY = delta * part.direction.y
    let moveZ = delta * part.direction.z

    // special case: origin.z must not go below zero
    if (part.origin.z - moveZ <= 0) {
      moveZ = part.origin.z
      delta = part.origin.z / part.direction.z
    }

    part.length += delta
    part.origin.x -= moveX
    part.origin.y -= moveY
    part.origin.z -= moveZ
  }
}

export interface RotateUpdate {
  type: 'rotate'
  payload: {
    axis: any
    angle: any
  }
}

export interface CreateUpdate {
  type: 'create'
  payload: {
    parts: Array<PartEntity>
  }
}

export interface DeleteUpdate {
  type: 'delete'
  payload: {
    parts: Array<Uuid>
  }
}

export type PartUpdate =
  | MoveUpdate
  | ScaleUpdate
  | RotateUpdate
  | CreateUpdate
  | DeleteUpdate

export function updatePart(part: PartState, update: PartUpdate) {
  switch (update.type) {
    case 'move':
      moveUpdate(part, update)
      break
    case 'scale':
      scaleUpdate(part, update)
      break
    case 'rotate':
      throw new Error('unimplemented')
    case 'create':
      throw new Error('unimplemented')
    case 'delete':
      throw new Error('unimplemented')
  }

  // ensure update is safe
  if (part.length < 1) part.length = 1
  if (part.origin.z < 0) part.origin.z = 0
}
