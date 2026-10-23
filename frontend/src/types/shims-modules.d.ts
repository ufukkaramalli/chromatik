declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: import('axios').AxiosInstance
    $formatCompactNumber: (num: number | string | null | undefined) => string
  }
}

export {}
