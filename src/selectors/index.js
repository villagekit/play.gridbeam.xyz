const { createSelector: reselector } = require('reselect')
const { prop, path } = require('ramda')
const { isArray } = Array
const isString = value => typeof value === 'string'

module.exports = selector

function selector (dependencies = [], select) {
  if (isArray(dependencies)) {
    dependencies = dependencies.map(dep =>
      isString(dep) ? prop(dep) : isArray(dep) ? path(dep) : dep
    )
  }
  return reselector(...dependencies, select)
}
