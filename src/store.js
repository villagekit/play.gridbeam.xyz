import { init } from '@rematch/core'
import selectPlugin from '@rematch/select'

import * as models from './models'

export default init({
  models,
  plugins: [selectPlugin()]
})
