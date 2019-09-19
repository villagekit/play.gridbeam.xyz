import React from 'react'
import { Flex, Text, Button } from 'rebass/styled-components'
import { useClipboard } from 'use-clipboard-copy'

export default Share

function Share (props) {
  const clipboard = useClipboard()
  return (
    <Flex m={2} p={3} flexDirection='column'>
      <Text m={2} fontSize={2} fontFamily='heading'>
        Share your creation!
      </Text>
      <Text
        ref={clipboard.target}
        as='input'
        m={2}
        fontFamily='body'
        value={window.location.href}
        readOnly
      />
      <Button m={2} fontFamily='body' onClick={clipboard.copy}>
        Copy to clipboard
      </Button>
    </Flex>
  )
}
