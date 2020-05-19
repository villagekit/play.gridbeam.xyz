import { useGlCameraInput, useGlSelection, useInput } from 'src'

export const useApp = () => {
  useInput()
}

export const useGl = () => {
  useGlSelection()
  useGlCameraInput()
}
