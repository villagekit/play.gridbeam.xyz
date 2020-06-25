/** @jsx jsx */
import { Fragment } from 'react'
import { DomApp, DomHead, withDomLayout } from 'src'
import { jsx } from 'theme-ui'

function Page() {
  return (
    <Fragment>
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
    </Fragment>
  )
}

export default withDomLayout(Page)
