const { createSelector: reselector } = require('reselect')
const { prop } = require('ramda')
const { isArray } = Array

module.exports = selector

function selector (dependencies, select) {
  if (isArray(dependencies)) {
    dependencies = dependencies.map(
      dep => (typeof dep === 'string' ? prop(dep) : dep)
    )
  }
  return reselector(...dependencies, select)
}
