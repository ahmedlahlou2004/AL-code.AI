// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ إعداد احترافي لمشروع React مع تحسين الأداء والتجربة
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,              // المنفذ المحلي أثناء التطوير
    open: true,              // يفتح المتصفح تلقائيًا عند التشغيل
    host: true,              // يسمح بالوصول من الأجهزة الأخرى على نفس الشبكة
  },
  build: {
    outDir: 'dist',          // مجلد الإخراج النهائي للبناء
    sourcemap: true,         // يسمح بتتبع الأخطاء في النسخة النهائية
    minify: 'esbuild',       // ضغط سريع وفعال للملفات
  },
  css: {
    devSourcemap: true,      // تتبع أسلوب CSS أثناء التطوير
  },
  resolve: {
    alias: {
      '@': '/src',           // تسهيل استدعاء الملفات من src
    },
  },
})
