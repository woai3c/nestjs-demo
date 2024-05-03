import chalk from 'chalk'
import { readFileSync } from 'fs'

const msgPath = process.argv[2]
const msg = readFileSync(msgPath, 'utf-8').trim()

const commitRE =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|release)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.log()
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red('Invalid commit message format')}\n\n` +
      chalk.red('  Please use the correct commit format:\n\n') +
      `    ${chalk.green("feat: add 'comments' option")}\n` +
      `    ${chalk.green('fix: handle events on blur (close #28)')}\n\n` +
      chalk.red(
        '  Please refer to the git commit specification: https://github.com/woai3c/Front-end-articles/blob/master/git%20commit%20style.md.\n',
      ),
  )

  process.exit(1)
}