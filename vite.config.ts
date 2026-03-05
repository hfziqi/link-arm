import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite 配置文件
 * 
 * 功能：
 * - 配置 React 插件支持 JSX
 * - 配置开发服务器
 */
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
