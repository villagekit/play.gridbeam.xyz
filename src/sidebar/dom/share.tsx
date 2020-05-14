import React from 'react'
import { Button, Flex, Input, Text } from 'theme-ui'
import { useClipboard } from 'use-clipboard-copy'

interface ShareProps {}

export function DomSidebarShare(props: ShareProps) {
  const clipboard = useClipboard()

  return (
    <Flex sx={{ margin: 2, padding: 3, flexDirection: 'column' }}>
      <Text sx={{ margin: 2, fontSize: 2, fontFamily: 'heading' }}>
        Share your creation!
      </Text>
      <Input
        ref={clipboard.target}
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
