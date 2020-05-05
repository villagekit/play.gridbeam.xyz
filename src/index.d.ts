import * as Pako from 'pako'

declare module 'pako' {
  export const { Z_BEST_COMPRESSION, deflateRaw, inflateRaw } = Pako
}
