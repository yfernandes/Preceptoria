import library from 'config/eslint/library.js'
import typescript from 'config/eslint/typescript.js'

export default typescript(import.meta.dirname, library, {
    ignores: [...library.ignores]
})
