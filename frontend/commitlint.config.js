export default {
  extends: ['@commitlint/config-conventional'],
  plugins: ['i18n'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复bug
        'docs', // 文档修改
        'style', // 代码格式修改
        'refactor', // 代码重构
        'perf', // 性能优化
        'test', // 测试用例修改
        'chore', // 其他修改
        'revert' // 回滚
      ]
    ],
    'type-case': [2, 'always', 'lower-case'], // type必须小写
    'subject-empty': [2, 'never'], // subject不能为空
    'type-empty': [2, 'never'] // type不能为空
  }
};