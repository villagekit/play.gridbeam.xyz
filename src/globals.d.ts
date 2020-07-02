declare module 'pako' {
  import Pako from 'pako'

  export const { inflateRaw, deflateRaw, Z_BEST_COMPRESSION } = Pako

  // export const Z_BEST_COMPRESSION = 9
}

// https://npmfs.com/package/@theme-ui/color/0.4.0-alpha.0/dist/index.d.ts
declare module '@theme-ui/color' {
  import { Theme } from '@theme-ui/css'

  /**
   * Darken a color by an amount 0–1
   */
  export const darken: (c: string, n: number) => (t: Theme) => string
  /**
   * Lighten a color by an amount 0–1
   */
  export const lighten: (c: string, n: number) => (t: Theme) => string
  /**
   * Rotate the hue of a color by an amount 0–360
   */
  export const rotate: (c: string, d: number) => (t: Theme) => string
  /**
   * Set the hue of a color to a degree 0–360
   */
  export const hue: (c: string, h: number) => (t: Theme) => string
  /**
   * Set the saturation of a color to an amount 0–1
   */
  export const saturation: (c: string, s: number) => (t: Theme) => string
  /**
   * Set the lightness of a color to an amount 0–1
   */
  export const lightness: (c: string, l: number) => (t: Theme) => string
  /**
   * Desaturate a color by an amount 0–1
   */
  export const desaturate: (c: string, n: number) => (t: Theme) => string
  /**
   * Saturate a color by an amount 0–1
   */
  export const saturate: (c: string, n: number) => (t: Theme) => string
  /**
   * Shade a color by an amount 0–1
   */
  export const shade: (c: string, n: number) => (t: Theme) => string
  /**
   * Tint a color by an amount 0–1
   */
  export const tint: (c: string, n: number) => (t: Theme) => string
  export const transparentize: (c: string, n: number) => (t: Theme) => string
  /**
   * Set the transparency of a color to an amount 0-1
   */
  export const alpha: (c: string, n: number) => (t: Theme) => string
  /**
   * Mix two colors by a specific ratio
   */
  export const mix: (a: string, b: string, n?: number) => (t: Theme) => string
  /**
   * Get the complement of a color
   */
  export const complement: (c: string) => (t: Theme) => string
  /**
   * Get the inverted color
   */
  export const invert: (c: string) => (t: Theme) => string
  /**
   * Desaturate the color to grayscale
   */
  export const grayscale: (c: string) => (t: Theme) => string
}

declare module 'csg-to-mesh'
declare module '@jscad/csg/src/api/ops-booleans'
declare module '@jscad/csg/src/api/primitives3d-api'
declare module 'unordered-array-remove'
declare module 'three-quaternion-from-normal'
declare module 'react-obfuscate'
