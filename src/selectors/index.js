import { createSelector as reselector } from 'reselect'
import { prop, path } from 'ramda'
const { isArray } = Array
const isString = value => typeof value === 'string'

export default selector

function selector (dependencies = [], select) {
  if (isArray(dependencies)) {
    dependencies = dependencies.map(dep =>
      isString(dep) ? prop(dep) : isArray(dep) ? path(dep) : dep
    )
  }
  return reselector(...dependencies, select)
}
