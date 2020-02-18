'use strict'
const defaults = require('defaults')
const compareFunc = require('compare-func')
const Q = require('q')
const readFile = Q.denodeify(require('fs').readFile)
const resolve = require('path').resolve
const path = require('path')
const debug = require('debug')('conventional-changelog:cmyr-config"')
// 自定义配置
let pkgJson = {}
try {
    pkgJson = require(path.resolve(process.cwd(), './package.json'))
} catch (err) {
    console.error('no root package.json found')
}

const { changelog } = pkgJson
const en = {
    feat: {
        title: '✨ Features',
        enable: true
    },
    fix: {
        title: '🐛 Bug Fixes',
        enable: true
    },
    perf: {
        title: '⚡ Performance Improvements',
        enable: true
    },
    revert: {
        title: '⏪ Reverts',
        enable: true
    },
    refactor: {
        title: '♻ Code Refactoring',
        enable: true
    },
    docs: {
        title: '📝 Documentation',
        enable: false
    },
    style: {
        title: '💄 Styles',
        enable: false
    },
    test: {
        title: '✅ Tests',
        enable: false
    },
    build: {
        title: '👷‍ Build System',
        enable: false
    },
    ci: {
        title: '🔧 Continuous Integration',
        enable: false
    },
    chore: {
        title: '🎫 Chores',
        enable: false
    }
}
const zh = {
    feat: {
        title: '✨ 新功能',
        enable: true
    },
    fix: {
        title: '🐛 Bug 修复',
        enable: true
    },
    perf: {
        title: '⚡ 性能优化',
        enable: true
    },
    revert: {
        title: '⏪ 回退',
        enable: true
    },
    refactor: {
        title: '♻ 代码重构',
        enable: true
    },
    docs: {
        title: '📝 文档',
        enable: false
    },
    style: {
        title: '💄 风格',
        enable: false
    },
    test: {
        title: '✅ 测试',
        enable: false
    },
    build: {
        title: '👷‍ 构建',
        enable: false
    },
    ci: {
        title: '🔧 CI 配置',
        enable: false
    },
    chore: {
        title: '🎫 其他更新',
        enable: false
    }
}
const _settings = /(zh|cn|Han)/i.test(changelog && changelog.language) ? zh : en
const defaultOptions = {
    bugsUrl: false,
    authorName: false,
    authorEmail: false,
    settings: _settings
}
const { bugsUrl, authorName, authorEmail, settings } = defaults(changelog, defaultOptions)

let gitUserInfo = ''
if (authorName && authorEmail) {
    gitUserInfo = 'by: **{{authorName}}** ({{authorEmail}})'
} else if (authorName) {
    gitUserInfo = 'by: **{{authorName}}**'
} else if (authorEmail) {
    gitUserInfo = 'by: ({{authorEmail}})'
}

module.exports = Q.all([
    readFile(resolve(__dirname, './templates/template.hbs'), 'utf-8'),
    readFile(resolve(__dirname, './templates/header.hbs'), 'utf-8'),
    readFile(resolve(__dirname, './templates/commit.hbs'), 'utf-8'),
    readFile(resolve(__dirname, './templates/footer.hbs'), 'utf-8')
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
                note.title = 'BREAKING CHANGES'
                discard = false
            })

            if (commit.type === 'feat') {
                commit.type = settings[commit.type].title
            } else if (commit.type === 'fix') {
                commit.type = settings[commit.type].title
            } else if (commit.type === 'perf') {
                commit.type = settings[commit.type].title
            } else if (commit.type === 'revert' || commit.revert) {
                commit.type = settings[commit.type].title
            } else if (commit.type === 'refactor') {
                commit.type = settings[commit.type].title // 以上为必须，以下为可选
            } else if (commit.type === 'docs' && settings[commit.type].enable) {
                commit.type = settings[commit.type].title
            } else if (commit.type === 'style' && settings[commit.type].enable) {
                commit.type = settings[commit.type].title
            } else if (commit.type === 'test' && settings[commit.type].enable) {
                commit.type = settings[commit.type].title
            } else if (commit.type === 'build' && settings[commit.type].enable) {
                commit.type = settings[commit.type].title
            } else if (commit.type === 'ci' && settings[commit.type].enable) {
                commit.type = settings[commit.type].title
            } else if (commit.type === 'chore' && settings[commit.type].enable) {
                commit.type = settings[commit.type].title
            } else if (discard) {
                return
            } else {
                return
            }

            debug('commit.type ：%s', commit.type)

            if (commit.scope === '*') {
                commit.scope = ''
            }

            if (typeof commit.hash === 'string') {
                commit.hash = commit.hash.substring(0, 7)
            }

            if (typeof commit.subject === 'string') {
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
        groupBy: 'type',
        commitGroupsSort: 'title',
        commitsSort: ['scope', 'subject'],
        noteGroupsSort: 'title',
        notesSort: compareFunc
    }
}
