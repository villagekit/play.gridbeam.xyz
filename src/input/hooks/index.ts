import { useClipboardInput } from './clipboard'
import { useKeyboard } from './keyboard'
import { useInputModifiers } from './modifiers'

export * from './clipboard'
export * from './keyboard'
export * from './modifiers'

export const useInput = () => {
  useClipboardInput()
  useInputModifiers()
  useKeyboard()
}

export default useInput
