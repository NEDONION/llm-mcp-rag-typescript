module.exports = {
  types: [
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'fix', name: 'fix:      修复bug' },
    { value: 'docs', name: 'docs:     文档修改' },
    { value: 'style', name: 'style:    代码格式修改（不影响功能的变动）' },
    { value: 'refactor', name: 'refactor: 代码重构（既不是新增功能，也不是修复bug）' },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'test', name: 'test:     测试用例修改' },
    { value: 'chore', name: 'chore:    其他修改' },
    { value: 'revert', name: 'revert:   回滚' }
  ],
  scopes: [
    { name: 'component' }, // 组件
    { name: 'utils' }, // 工具类
    { name: 'config' }, // 配置
    { name: 'other' }, // 其他
  ],
  allowCustomScopes: true, // 允许自定义 scope
  allowEmptyScopes: true, // 允许空 scope
};