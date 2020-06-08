import React from 'react'
import { DomApp, DomHead, withDomLayout } from 'src'

function Page() {
  return (
    <>
      <DomHead
        keywords={[
          'grid',
          'beam',
          'modular',
          'open',
          'hardware',
          'construction',
          'furniture',
        ]}
      />
      <DomApp />
    </>
  )
}

export default withDomLayout(Page)
