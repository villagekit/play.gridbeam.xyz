// declarative part updates

import { zipObject } from 'lodash'

import { PartEntity, Uuid } from '../store'

type PartState = PartEntity
type PartUpdaterForEach<T> = (part: PartState, update: T) => void

export enum LengthDirection {
  positive = 'positive',
  negative = 'negative',
}

export interface MoveUpdate {
  type: 'move'
  payload: {
    uuids: Array<Uuid>
    delta: [number, number, number]
  }
}

const moveUpdate: PartUpdaterForEach<MoveUpdate> = (part, update) => {
  const { delta } = update.payload

  part.origin.x += delta[0]
  part.origin.y += delta[1]
  part.origin.z += delta[2]

  // ensure origin.z doesn't go below 0
  if (part.origin.z < 0) part.origin.z = 0
}

export interface ScaleUpdate {
  type: 'scale'
  payload: {
    uuids: Array<Uuid>
    delta: number
    lengthDirection: LengthDirection
  }
}

const scaleUpdate: PartUpdaterForEach<ScaleUpdate> = (part, update) => {
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

  // ensure length doesn't go below 1
  if (part.length < 1) part.length = 1
}

export interface RotateUpdate {
  type: 'rotate'
  payload: {
    uuids: Array<Uuid>
    axis: any
    angle: any
  }
}

export interface CreateUpdate {
  type: 'create'
  payload: {
    uuids: Array<Uuid>
    parts: Array<PartEntity>
  }
}

export interface DeleteUpdate {
  type: 'delete'
  payload: {
    uuids: Array<Uuid>
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
    default:
      throw new Error(`unexpected update: ${update.type}`)
  }
}

export function updateParts(
  parts: Record<Uuid, PartState>,
  update: PartUpdate,
) {
  switch (update.type) {
    case 'move':
      forEachPartInUuids(parts, update.payload.uuids, (part) =>
        moveUpdate(part, update),
      )
      break
    case 'scale':
      forEachPartInUuids(parts, update.payload.uuids, (part) =>
        scaleUpdate(part, update),
      )
      break
    case 'rotate':
      throw new Error('unimplemented')
    case 'create':
      const { uuids, parts: newParts } = update.payload
      const newPartsByUuid = zipObject(uuids, newParts)
      Object.assign(parts, newPartsByUuid)
      break
    case 'delete':
      update.payload.uuids.forEach((uuid) => {
        delete parts[uuid]
      })
  }
}

function forEachPartInUuids(
  parts: Record<Uuid, PartState>,
  uuids: Array<Uuid>,
  forEach: (part: PartState) => void,
) {
  uuids.forEach((uuid) => {
    const part = parts[uuid]
    forEach(part)
  })
}
