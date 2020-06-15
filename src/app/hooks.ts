import {
  useGlCameraInput,
  useGlScene,
  useGlSelection,
  useInput,
  usePersist,
} from 'src'

export const useApp = () => {
  useInput()
  usePersist()
}

export const useGl = () => {
  useGlSelection()
  useGlCameraInput()
  useGlScene()
}
