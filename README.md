<h1 align="center">conventional-changelog-cmyr-config </h1>
<p>
  <a href="https://www.npmjs.com/package/conventional-changelog-cmyr-config" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/conventional-changelog-cmyr-config.svg">
  </a>
  <a href="https://github.com/CaoMeiYouRen/conventional-changelog-cmyr-config#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/CaoMeiYouRen/conventional-changelog-cmyr-config/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/CaoMeiYouRen/conventional-changelog-cmyr-config/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/CaoMeiYouRen/conventional-changelog-cmyr-config" />
  </a>
</p>


> 本项目fork自[conventional-changelog-custom-config](https://github.com/ITxiaohao/conventional-changelog-custom-config)，在原有基础上添加了更多自定义部分

### 🏠 [主页](https://github.com/CaoMeiYouRen/conventional-changelog-cmyr-config#readme)

## 前置准备

-   [commitizen](https://github.com/commitizen/cz-cli) 针对开发者简单的 commit 规范

-   [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog) 使用 cz-conventional-changelog 的构建标准

-   [conventional-changelog-cli](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli#readme) conventional-changelog 核心模块

    ```bash
    npm i commitizen cz-conventional-changelog conventional-changelog-cli --save-dev
    ```

## 安装

```sh
yarn add conventional-changelog-cmyr-config
```

## 配置

在 package.json 中配置参数

不填配置的话则会按照预设模版生成 CHANGELOG

```json
{
  "scripts": {
    "commit": "git-cz && git push",
    "release": "release-it",
    "changelog": "conventional-changelog -p cmyr-config -i CHANGELOG.md -s -r 0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/example.git"
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  },
  "changelog": {
    "bugsUrl": "https://redmine.example.com/issues/",
    "authorName": true,
    "authorEmail": true,
    "language": "zh",//本项支持zh和en配置，默认为en，即生成英文changelog，配置后以下settings可省略。（但如果配置了settings会覆盖language的默认配置）
    "settings": {//cmyr-config新增功能，可自定义标题和是否启用某项
      "feat": {
        "title": "✨ 新功能",//定义标题
        "enable": true //定义是否启用该类型，注意feat、fix、perf、revert、refactor这几个类型的commit无法关闭
      },
      "fix": {
        "title": "🐛 Bug 修复"
      },
      "perf": {
        "title": "⚡ 性能优化"
      },
      "revert": {
        "title": "⏪ 回退"
      },
      "refactor": {
        "title": "♻ 代码重构"
      },
      "docs": {
        "title": "📝 文档",
        "enable": false
      },
      "style": {
        "title": "💄 风格",
        "enable": false
      },
      "test": {
        "title": "✅ 测试",
        "enable": false
      },
      "build": {
        "title": "👷‍ 构建",
        "enable": false
      },
      "ci": {
        "title": "🔧 CI 配置",
        "enable": false
      },
      "chore": {
        "title": "🎫 其他更新",
        "enable": false
      }
    }
  }
}
```

**bugsUrl**

Type: `string` Default: `false`

当你需要将 issues URL 替换成其他 URL 时，使用该参数，例如使用 **redmine** 管理项目, `bugsUrl: 'https://redmine.example.com/issues/'`

如果不填 `bugsUrl` 则会根据 **package.json** 中的 `repository.url` 来作为 issues URL

如果你使用了第三方的协作系统（例如 **bitbucket**）， 推荐你使用这个插件 [conventional-changelog-angular-bitbucket](https://github.com/uglow/conventional-changelog-angular-bitbucket)

**emojis types 参考 [gitmoji](https://gitmoji.carloscuesta.me/)**

| Commit Type | Title                    | Description                                                  | Emojis |
| ----------- | ------------------------ | ------------------------------------------------------------ | ------ |
| `feat`      | Features                 | A new feature                                                | ✨      |
| `fix`       | Bug Fixes                | A bug Fix                                                    | 🐛      |
| `docs`      | Documentation            | Documentation only changes                                   | 📝      |
| `style`     | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) | 💄      |
| `refactor`  | Code Refactoring         | A code change that neither fixes a bug nor adds a feature    | ♻️      |
| `perf`      | Performance Improvements | A code change that improves performance                      | ⚡️      |
| `test`      | Tests                    | Adding missing tests or correcting existing tests            | ✅      |
| `build`     | Build                    | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm) | 👷      |
| `ci`        | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) | 🔧      |
| `chore`     | Chores                   | Other changes that don't modify src or test files            | 🎫      |
| `revert`    | Reverts                  | Reverts a previous commit                                    | ⏪      |

**authorName**

Type: `boolean` Default: `false`

在 CHANGELOG 中生成用户名

**authorEmail**

Type: `boolean` Default: `false`

在 CHANGELOG 中生成邮箱

## 使用

生成 CHANGELOG 之前得**先** commit，记得在 **master** **主分支**上发布版本，再生成 CHANGELOG，流程如下：

```sh
git add .

npm run commit

npm run release

npm run changelog
```

## 作者


👤 **CaoMeiYouRen <caomeiyouren@gmail.com>**

* Website: https://blog.cmyr.ltd
* GitHub: [@CaoMeiYouRen](https://github.com/CaoMeiYouRen)

## 🤝贡献

欢迎Contributions, issues and feature!<br />如有问题请查看 [issues page](https://github.com/CaoMeiYouRen/conventional-changelog-cmyr-config/issues). 您还可以查看[contributing guide](https://github.com/CaoMeiYouRen/conventional-changelog-cmyr-config/blob/master/CONTRIBUTING.md).

## 支持

如果觉得这个项目有用的话请给一颗⭐️，非常感谢

## 📝 License

Copyright © 2020 [CaoMeiYouRen <caomeiyouren@gmail.com>](https://github.com/CaoMeiYouRen).<br />
This project is [MIT](https://github.com/CaoMeiYouRen/conventional-changelog-cmyr-config/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
