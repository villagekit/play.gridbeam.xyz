import { isArray, mapValues } from 'lodash'

import { PartEntity, PartTransition, Uuid } from '../store'
import { PartUpdate } from './updater'

export type ReverseUpdate = Record<Uuid, PartUpdate>

// TODO needs to handle part copypasta / new parts / deleting parts
// - copypasta has a transition sequence when placing new parts
// - deleting parts just happens
export interface Undo {
  transition: PartTransition
  reverseUpdate: ReverseUpdate
}

/*
interface GenerateUndoFromTransitionOptions {
  transitioningEntities: Record<Uuid, PartEntity>
  currentTransition: PartTransition
}

export function generateUndoFromTransition(
  options: GenerateUndoFromTransitionOptions,
) {
  const { transitioningEntities, currentTransition } = options
  const { update } = currentTransition

  const reverseUpdate = mapValues(transitioningEntities, (entity) => {
    return generateReverseUpdate({ update, entity })
  })

  const undo: Undo = {
    transition: currentTransition,
    reverseUpdate,
  }

  return undo
}

interface GenerateReverseUpdateOptions {
  entity: PartEntity
  update: UpdateDescriptor
}

function generateReverseUpdate(
  options: GenerateReverseUpdateOptions,
): UpdateDescriptor {
  const { entity, update } = options

  if (update == null) {
    return null
  }

  if (isArray(update)) {
    return update.map(
      (childUpdate): UpdateDescriptorAtom =>
        generateReverseUpdate({ entity, update: childUpdate }),
    )
  }

  switch (update.update) {
    case 'set':
      return null
  }
}
*/

/*
  // generate undo using un-updated state
  let reverseUpdate: Undo['reverseUpdate'] = {}
  let undo: Undo = {
    transition: currentTransition,
    reverseUpdate,
  }
  const updates = isArray(update) ? flatten(update) : [update]
  forEach(keys(selectedUuids), (uuid: Uuid) => {
    forEach(updates, (update: UpdateDescriptor) => {
      if (update == null || isArray(update)) return
      const { path } = update
      const entity = entities[uuid]
      const previousValueAtPath = get(entity, path)
      if (reverseUpdate[uuid] == null) {
        reverseUpdate[uuid] = [] as Array<UpdateDescriptorAtom>
      }
      // @ts-ignore
      reverseUpdate[uuid].push({
        update: 'set',
        path,
        value: previousValueAtPath,
      })
    })
  })
*/
