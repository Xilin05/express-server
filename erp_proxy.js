/**
 * 进程捕捉异常与错误
 *
 */
process.on('uncaughtException', err => {
  console.log(`\n\n
    -----------------${new Date()} ${new Date().getMilliseconds()}-----------------
      uncaughtException: ${err}
    ------\n\n
  `)
})

const fs = require('fs')

const express = require('express')
const app = express()

// 配置方向代理
const { createProxyMiddleware } = require('http-proxy-middleware')

// 静态资源服务目录
// const STATIC_PATH = "./server/erp_fe";
const STATIC_PATH = './dist'
// const STATIC_PATH = "../erp_fe/dist";

const baseConfig = require(STATIC_PATH + '/package-proxy.json')

// 反向代理业务
console.info(baseConfig.proxyConfig)
const configs = Object.entries(baseConfig.proxyConfig)

if (configs && Array.isArray(configs) && configs.length) {
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i] || {}

    if (
      !config[0] ||
      !config[1] ||
      !config[1].list ||
      !Array.isArray(config[1].list) ||
      !config[1].list.length
    )
      continue

    // 反向代理域名
    const origin = config[0]
    const author = config[1].author

    // 白名单列表
    for (let j = 0; j < config[1].list.length; j++) {
      const apiPath = config[1].list[j]

      // 是否需要重写API路径
      if (apiPath && apiPath.api_path && apiPath.pathRewrite) {
        const proxyOptions = {}

        proxyOptions[apiPath.api_path] = apiPath.pathRewrite

        app.use(
          apiPath.api_path,
          createProxyMiddleware({
            logger: console,
            target: origin,
            changeOrigin: true,
            pathRewrite: proxyOptions,
            on: {
              proxyReq: (proxyReq, req, res) => {
                proxyRes.headers['x-added'] = 'foobar'
                console.info('代理请求: ', proxyReq, req, res)
              },
              proxyRes: (proxyRes, req, res) => {
                proxyReq.setHeader('x-added', 'foobar')
                console.info('代理响应: ', proxyRes, req, res)
              },
              error: (err, req, res) => {
                /* handle error */
              }
            }
          })
        )
      }

      if (apiPath && typeof apiPath === 'string') {
        const proxyOptions = {}

        proxyOptions[apiPath] = config[1].path + apiPath
        const targetPath = origin + proxyOptions[apiPath]

        console.info(
          `\n ${author} : `,
          proxyOptions[apiPath],
          origin,
          targetPath,
          '\n'
        )

        app.use(
          apiPath,
          // proxyOptions[apiPath],
          createProxyMiddleware({
            target: origin,
            // target: targetPath,
            changeOrigin: true,
            pathRewrite: proxyOptions,
            on: {
              proxyReq: (proxyReq, req, res) => {
                // console.info('代理请求: ', proxyReq, req, res)
              },
              proxyRes: (proxyRes, req, res) => {
                // console.info('代理响应: ', proxyRes, req, res)
              },
              error: (err, req, res) => {
                /* handle error */
              }
            }
          })
        )
      }
    }
  }
}

// 刷新问题
const history = require('connect-history-api-fallback')
app.use(history())

// 静态资源服务
const serveStatic = require('serve-static')
app.use(serveStatic(STATIC_PATH))

// 跨域问题
const cors = require('cors')
app.use(cors())

// 路由拦截
app.all('*', (req, res, next) => {
  // console.log('路由：', req, res);
  next()
})

/*--------------------------------------------------*/
const port = 4399
app.listen(port)

console.log(`

··································${new Date()}··································
PORT: ${port}    Server is Running...
····· 
·  
http://localhost:${port}
server is starting ...
`)

/**
 * 异常机制
 */
app.on('error', err => {
  //err.stack
  console.log(`\n\n Express异常错误机制  \n ${err}  \n\n`)
})
