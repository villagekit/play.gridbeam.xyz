import { groupBy, path } from 'ramda'
import createSelector from './'

export const selectParts = createSelector(
  [
    'parts',
    'hover',
    'unhover',
    'hoveredUuids',
    'selects',
    'selectedUuids',
    'updateSelected'
  ],
  function (
    parts,
    hover,
    unhover,
    hoveredUuids,
    selects,
    selectedUuids,
    updateSelected
  ) {
    return Object.entries(parts).map(([uuid, part]) =>
      Object.assign({}, part, {
        uuid,
        value: part,
        isHovered: Boolean(uuid in hoveredUuids),
        hover: () => hover(uuid),
        unhover: () => unhover(uuid),
        isSelected: Boolean(uuid in selectedUuids),
        select: () => selects([uuid]),
        move: delta =>
          updateSelected(part => {
            part.origin[0] += delta[0]
            part.origin[1] += delta[1]
            part.origin[2] += delta[2]
          })
      })
    )
  }
)

export const selectPartsByType = createSelector(
  [selectParts],
  groupBy(path(['value', 'type']))
)
