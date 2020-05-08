import React from 'react'

import Provider from './src/app/components/provider'

export const wrapRootElement = ({ element }) => <Provider>{element}</Provider>
