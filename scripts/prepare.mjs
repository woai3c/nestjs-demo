import { execSync } from 'child_process'

if (process.env.NODE_ENV !== 'production') {
  execSync('npx husky', { stdio: 'inherit' })
}
