declare module 'vue-json-viewer' {
  const plugin: import('vue').Plugin
  export default plugin
}

declare module 'vue-resize-text' {
  const plugin: import('vue').Plugin
  export default plugin
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: import('axios').AxiosInstance
    $formatCompactNumber: (num: number | string | null | undefined) => string
  }
}
