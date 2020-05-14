import React from 'react'
import { DomHead, DomLayout } from 'src'

const NotFoundPage = () => (
  <DomLayout>
    <DomHead title="404: Not found" />
    <h1>404: NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist...</p>
  </DomLayout>
)

export default NotFoundPage
