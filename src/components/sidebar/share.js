import React from 'react'
import { Button, Flex, Text } from 'theme-ui'
import { useClipboard } from 'use-clipboard-copy'

export default Share

function Share(props) {
  const clipboard = useClipboard()
  return (
    <Flex sx={{ margin: 2, padding: 3, flexDirection: 'column' }}>
      <Text sx={{ margin: 2, fontSize: 2, fontFamily: 'heading' }}>
        Share your creation!
      </Text>
      <Text
        ref={clipboard.target}
        as="input"
        sx={{
          margin: 2,
          fontFamily: 'body',
        }}
        value={window.location.href}
        readOnly
      />
      <Button sx={{ margin: 2, fontFamily: 'body' }} onClick={clipboard.copy}>
        Copy to clipboard
      </Button>
    </Flex>
  )
}
