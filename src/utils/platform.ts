export const isTauri = () => {
  const result = typeof window !== 'undefined' && 
    (window as any).__TAURI__ !== undefined
  console.log('[Platform] isTauri check:', result, 'window.__TAURI__:', (window as any).__TAURI__)
  return result
}
