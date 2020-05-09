import { useClipboard } from './clipboard'
import { useInputModifiers } from './modifiers'

export * from './camera'
export * from './clipboard'
export * from './modifiers'

export const useInput = () => {
  useInputModifiers()
  useClipboard()
}

export default useInput
