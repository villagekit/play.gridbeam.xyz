import React from 'react'
import { Point, useDomSelection } from 'src'
import { Box } from 'theme-ui'

interface SelectionBoxProps {}

export function DomSelectionBox(props: SelectionBoxProps) {
  const { isSelecting, startPoint, endPoint } = useDomSelection()

  if (!isSelecting) return null

  return <SelectBox startPoint={startPoint} endPoint={endPoint} />
}

interface SelectBoxProps {
  startPoint: Point
  endPoint: Point
}

function SelectBox(props: SelectBoxProps) {
  const { startPoint, endPoint } = props

  const bottomRightPoint = React.useMemo(
    () => ({
      x: ((Math.max(startPoint.x, endPoint.x) + 1) / 2) * window.innerWidth,
      y: (-(Math.min(startPoint.y, endPoint.y) - 1) / 2) * window.innerHeight,
    }),
    [startPoint, endPoint],
  )

  const topLeftPoint = React.useMemo(
    () => ({
      x: ((Math.min(startPoint.x, endPoint.x) + 1) / 2) * window.innerWidth,
      y: (-(Math.max(startPoint.y, endPoint.y) - 1) / 2) * window.innerHeight,
    }),
    [startPoint, endPoint],
  )

  return (
    <Box
      css={{
        pointerEvents: 'none',
        border: '1px solid #55aaff',
        backgroundColor: 'rgba(75, 160, 255, 0.3)',
        position: 'fixed',
      }}
      style={{
        left: topLeftPoint.x,
        top: topLeftPoint.y,
        width: bottomRightPoint.x - topLeftPoint.x,
        height: bottomRightPoint.y - topLeftPoint.y,
      }}
    />
  )
}
