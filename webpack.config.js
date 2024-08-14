// eslint-disable-next-line no-undef
const path = require('path')

// eslint-disable-next-line no-undef
module.exports = {
  // webpack 配置
  webpack: {
    // 配置别名
    alias: {
      // 约定：使用 @ 表示 src 文件所在路径
      // eslint-disable-next-line no-undef
      '@': path.join(__dirname, './src/renderer')
    }
  }
}
