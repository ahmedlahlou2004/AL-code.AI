import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // تجاهل مجلد dist بالكامل
  globalIgnores(['dist', 'node_modules']),

  {
    files: ['**/*.{js,jsx,ts,tsx}'], // دعم TS/TSX أيضًا
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node }, // دعم متغيرات المتصفح وNode
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // لا تعتبر المتغيرات التي تبدأ بـ _ أو A-Z غير مستخدمة
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-hooks/rules-of-hooks': 'error',   // التحقق من قواعد Hooks
      'react-hooks/exhaustive-deps': 'warn',   // تحذير عن الـ dependencies في useEffect
      'no-console': 'warn',                     // تحذير عند استخدام console.log
      'semi': ['error', 'always'],              // إجبار على وجود الفواصل المنقوطة
      'quotes': ['error', 'single'],            // استخدام single quotes
    },
  },
])
