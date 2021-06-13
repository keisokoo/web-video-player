declare module 'custom-types' {
  export interface FileProps {
    extension: string
    file_id?: number
    name: string
    path: string
    size: number
    type: string
    src?: string
    index?: number
    atimeMs: number
    mtimeMs: number
    ctimeMs: number
    birthtimeMs: number
  }
  export namespace customTypes {
    type foo = string
    interface Bar {
      baz: number
    }
  }
}
interface CSSModule {
  [key: string]: string
}

declare module '*.css' {
  const styles: CSSModule
  export default styles
}
declare module '*.scss' {
  const styles: CSSModule
  export default styles
}
