import { useClipboard } from './clipboard'
import { useKeyboard } from './keyboard'
import { useInputModifiers } from './modifiers'

export * from './camera'
export * from './clipboard'
export * from './keyboard'
export * from './modifiers'

export const useInput = () => {
  useClipboard()
  useInputModifiers()
  useKeyboard()
}

export default useInput
