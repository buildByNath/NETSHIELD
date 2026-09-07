/// <reference types="vite/client" />

declare module '*.png?url' {
  const src: string;
  export default src;
}

declare module '*.tmj?raw' {
  const content: string;
  export default content;
}
