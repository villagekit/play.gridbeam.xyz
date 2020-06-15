import React from 'react'
import { useSelector } from 'react-redux'
import {
  getIsSelecting,
  getSceneSize,
  getSelectionEndPoint,
  getSelectionStartPoint,
  Point,
} from 'src'
import { Box } from 'theme-ui'

interface SelectionBoxProps {}

export function DomSelectionBox(props: SelectionBoxProps) {
  const isSelecting = useSelector(getIsSelecting)
  const startPoint = useSelector(getSelectionStartPoint)
  const endPoint = useSelector(getSelectionEndPoint)
  const size = useSelector(getSceneSize)

  if (!isSelecting) return null

  return <SelectBox startPoint={startPoint} endPoint={endPoint} size={size} />
}

interface SelectBoxProps {
  startPoint: Point
  endPoint: Point
  size: ReturnType<typeof getSceneSize>
}

function SelectBox(props: SelectBoxProps) {
  const { startPoint, endPoint, size } = props

  const bottomRightPoint = React.useMemo(() => {
    if (size == null) return { x: 0, y: 0 }
    return {
      x: ((Math.max(startPoint.x, endPoint.x) + 1) / 2) * size.width,
      y: (-(Math.min(startPoint.y, endPoint.y) - 1) / 2) * size.height,
    }
  }, [size, startPoint.x, startPoint.y, endPoint.x, endPoint.y])

  const topLeftPoint = React.useMemo(() => {
    if (size == null) return { x: 0, y: 0 }
    return {
      x: ((Math.min(startPoint.x, endPoint.x) + 1) / 2) * size.width,
      y: (-(Math.max(startPoint.y, endPoint.y) - 1) / 2) * size.height,
    }
  }, [size, startPoint.x, startPoint.y, endPoint.x, endPoint.y])

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
