import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GrZoomIn } from 'react-icons/gr'
import { IoMdHand, IoMdPlanet } from 'react-icons/io'
import { useAppDispatch } from 'src'
import { Flex, IconButton } from 'theme-ui'

import { CameraControlMode, doSetCameraControlMode } from '..'

interface CameraWidgetProps {}

export function DomCameraWidget(props: CameraWidgetProps) {
  return (
    <CameraWidgetContainer>
      <CameraControlModeButtons />
    </CameraWidgetContainer>
  )
}

interface CameraControlButtonDescriptor {
  name: string
  mode: CameraControlMode
  Icon: React.ReactType
}

interface CameraControlModeButtonsProps {}

type ModeStatuses = Record<CameraControlMode, boolean>

const CameraControlModeButtons = (props: CameraControlModeButtonsProps) => {
  const cameraControlButtonDescriptors: Array<CameraControlButtonDescriptor> = useMemo(
    () => [
      {
        name: 'orbit',
        mode: CameraControlMode.Orbit,
        Icon: IoMdPlanet,
      },
      {
        name: 'pan',
        mode: CameraControlMode.Pan,
        Icon: IoMdHand,
      },
      {
        name: 'orbit',
        mode: CameraControlMode.Zoom,
        Icon: GrZoomIn,
      },
    ],
    [],
  )

  const dispatch = useAppDispatch()

  const [activeMode, setActiveMode] = useState<CameraControlMode | null>(null)
  const [hoveredMode, setHoveredMode] = useState<CameraControlMode | null>(null)
  const [isTouching, setIsTouching] = useState<boolean>(false)

  const handleEnter = useCallback(
    (mode: CameraControlMode) => (ev: React.MouseEvent) => {
      setHoveredMode(mode)
      if (!isTouching) setActiveMode(mode)
    },
    [isTouching],
  )
  const handleLeave = useCallback(
    (mode: CameraControlMode) => (ev: React.MouseEvent) => {
      setHoveredMode(null)
      if (!isTouching) setActiveMode(CameraControlMode.Default)
    },
    [isTouching],
  )

  const handleTouch = useCallback(
    (mode: CameraControlMode) => (ev: React.MouseEvent) => {
      setIsTouching(true)

      // re-dispatch mouse event to gl canvas
      const glCanvas = document.querySelector('#scene-container > canvas')
      if (glCanvas) {
        const eventCopy = document.createEvent('MouseEvent')
        eventCopy.initMouseEvent(
          ev.type,
          ev.bubbles,
          ev.cancelable,
          // @ts-ignore
          ev.view,
          ev.detail,
          ev.screenX,
          ev.screenY,
          ev.clientX,
          ev.clientY,
          ev.ctrlKey,
          ev.altKey,
          ev.shiftKey,
          ev.metaKey,
          ev.button,
          ev.relatedTarget,
        )
        glCanvas.dispatchEvent(eventCopy)
      }
    },
    [setIsTouching],
  )
  const handleUntouch = useCallback(
    (ev: MouseEvent) => {
      setIsTouching(false)
      setActiveMode(hoveredMode)
    },
    [hoveredMode],
  )

  useEffect(() => {
    document.addEventListener('mouseup', handleUntouch)

    return () => {
      document.removeEventListener('mouseup', handleUntouch)
    }
  }, [handleUntouch])

  useEffect(() => {
    const mode = activeMode || CameraControlMode.Default
    dispatch(doSetCameraControlMode(mode))
  }, [activeMode, dispatch])

  return (
    <>
      {cameraControlButtonDescriptors.map((cameraControlButtonDescriptor) => {
        const { mode } = cameraControlButtonDescriptor
        return (
          <CameraControlModeButton
            key={mode}
            {...cameraControlButtonDescriptor}
            onMouseEnter={handleEnter(mode)}
            onMouseLeave={handleLeave(mode)}
            onMouseDown={handleTouch(mode)}
          />
        )
      })}
    </>
  )
}

type CameraControlModeButtonProps = CameraControlButtonDescriptor &
  React.ComponentProps<typeof IconButton>

const CameraControlModeButton = (props: CameraControlModeButtonProps) => {
  const { name, Icon } = props

  return (
    <IconButton sx={{ padding: 2, height: 5, width: 5 }} {...props}>
      <Icon size={'100%'} title={name} />
    </IconButton>
  )
}

interface CameraWidgetContainerProps
  extends React.ComponentProps<typeof Flex> {}

const CameraWidgetContainer = (props: CameraWidgetContainerProps) => (
  <Flex
    sx={{
      flexDirection: 'column',
      position: 'absolute',
      right: 0,
      top: 0,
    }}
    {...props}
  />
)
