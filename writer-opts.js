'use strict'

const compareFunc = require(`compare-func`)
const Q = require(`q`)
const readFile = Q.denodeify(require(`fs`).readFile)
const resolve = require(`path`).resolve
const path = require('path')

// 自定义配置
let pkgJson = {}
try {
  pkgJson = require(path.resolve(process.cwd(), './package.json'))
} catch (err) {
  console.error('no root package.json found')
}

const { changelog } = pkgJson
let bugsUrl = changelog ? changelog.bugsUrl || false : false
if (typeof bugsUrl !== 'string') bugsUrl = false
let emojis = changelog ? changelog.emojis || false : false
let authorName = changelog ? changelog.authorName || false : false
let authorEmail = changelog ? changelog.authorEmail || false : false

let gitUserInfo = ''
if (authorName && authorEmail) {
  gitUserInfo = `by: **{{authorName}}** ({{authorEmail}})`
}
if (authorName && authorEmail === false) {
  gitUserInfo = `by: **{{authorName}}**`
}
if (authorName === false && authorEmail) {
  gitUserInfo = `by: ({{authorEmail}})`
}

module.exports = Q.all([
  readFile(resolve(__dirname, `./templates/template.hbs`), `utf-8`),
  readFile(resolve(__dirname, `./templates/header.hbs`), `utf-8`),
  readFile(resolve(__dirname, `./templates/commit.hbs`), `utf-8`),
  readFile(resolve(__dirname, `./templates/footer.hbs`), `utf-8`)
]).spread((template, header, commit, footer) => {
  const writerOpts = getWriterOpts()

  writerOpts.mainTemplate = template
  writerOpts.headerPartial = header
  // 替换 commit.hbs 模板中的 gitUserInfo
  writerOpts.commitPartial = commit.replace(/{{gitUserInfo}}/g, gitUserInfo)
  writerOpts.footerPartial = footer

  return writerOpts
})

function getWriterOpts() {
  return {
    transform: (commit, context) => {
      let discard = true
      const issues = []

      commit.notes.forEach(note => {
        note.title = `BREAKING CHANGES`
        discard = false
      })

      if (emojis) {
        if (commit.type === `feat`) {
          commit.type = `:sparkles: Features`
        } else if (commit.type === `fix`) {
          commit.type = `:bug: Bug Fixes`
        } else if (commit.type === `perf`) {
          commit.type = `:zap: Performance Improvements`
        } else if (commit.type === `revert`) {
          commit.type = `:rewind: Reverts`
        } else if (discard) {
          return
        } else if (commit.type === `docs`) {
          commit.type = `:memo: Documentation`
        } else if (commit.type === `style`) {
          commit.type = `:lipstick: Styles`
        } else if (commit.type === `refactor`) {
          commit.type = `:recycle: Code Refactoring`
        } else if (commit.type === `test`) {
          commit.type = `:white_check_mark: Tests`
        } else if (commit.type === `build`) {
          commit.type = `:construction_worker: Build System`
        } else if (commit.type === `ci`) {
          commit.type = `:wrench: Continuous Integration`
        } else if (commit.type === 'chore') {
          commit.type = ':ticket: Chores'
        }
      } else {
        if (commit.type === `feat`) {
          commit.type = `Features`
        } else if (commit.type === `fix`) {
          commit.type = `Bug Fixes`
        } else if (commit.type === `perf`) {
          commit.type = `Performance Improvements`
        } else if (commit.type === `revert`) {
          commit.type = `Reverts`
        } else if (discard) {
          return
        } else if (commit.type === `docs`) {
          commit.type = `Documentation`
        } else if (commit.type === `style`) {
          commit.type = `Styles`
        } else if (commit.type === `refactor`) {
          commit.type = `Code Refactoring`
        } else if (commit.type === `test`) {
          commit.type = `Tests`
        } else if (commit.type === `build`) {
          commit.type = `Build System`
        } else if (commit.type === `ci`) {
          commit.type = `Continuous Integration`
        } else if (commit.type === 'chore') {
          commit.type = 'Chores'
        }
      }

      if (commit.scope === `*`) {
        commit.scope = ``
      }

      if (typeof commit.hash === `string`) {
        commit.hash = commit.hash.substring(0, 7)
      }

      if (typeof commit.subject === `string`) {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl
        if (url) {
          url = `${url}/issues/`
          // Issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue)
            return `[#${issue}](${url}${issue})`
          })
        }
        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
            (_, username) => {
              if (username.includes('/')) {
                return `@${username}`
              }

              return `[@${username}](${context.host}/${username})`
            }
          )
        }
      }

      // remove references that already appear in the subject
      commit.references = commit.references.filter(reference => {
        if (issues.indexOf(reference.issue) === -1) {
          return true
        }

        return false
      })

      if (bugsUrl) {
        commit.references = commit.references.map(ref => {
          return {
            ...ref,
            bugsUrl
          }
        })
      }

      return commit
    },
    groupBy: `type`,
    commitGroupsSort: `title`,
    commitsSort: [`scope`, `subject`],
    noteGroupsSort: `title`,
    notesSort: compareFunc
  }
}
