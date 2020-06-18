import React from 'react'
import { useSelector } from 'react-redux'
import { useThree } from 'react-three-fiber'
import {
  getIsSelecting,
  getSceneSize,
  getSelectionEndPoint,
  getSelectionStartPoint,
  Point,
} from 'src'
import { Box } from 'theme-ui'

interface SelectionBoxProps {}

export function DomSelectionBox(
  props: SelectionBoxProps,
): React.ReactElement | null {
  const isSelecting = useSelector(getIsSelecting)
  const startPoint = useSelector(getSelectionStartPoint)
  const endPoint = useSelector(getSelectionEndPoint)
  const size = useSelector(getSceneSize)

  if (!isSelecting) return null
  if (startPoint == null || endPoint == null || size == null) return null

  return <SelectBox startPoint={startPoint} endPoint={endPoint} size={size} />
}

interface SelectBoxProps {
  startPoint: Point
  endPoint: Point
  size: ReturnType<typeof useThree>['size']
}

function SelectBox(props: SelectBoxProps) {
  const { startPoint, endPoint, size } = props

  const bottomRightPoint = React.useMemo(() => {
    return {
      x: ((Math.max(startPoint.x, endPoint.x) + 1) / 2) * size.width,
      y: (-(Math.min(startPoint.y, endPoint.y) - 1) / 2) * size.height,
    }
  }, [size, startPoint, endPoint])

  const topLeftPoint = React.useMemo(() => {
    return {
      x: ((Math.min(startPoint.x, endPoint.x) + 1) / 2) * size.width,
      y: (-(Math.max(startPoint.y, endPoint.y) - 1) / 2) * size.height,
    }
  }, [size, startPoint, endPoint])

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
