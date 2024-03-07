const fs = require('fs')
const express = require('express')

// 2) 创建 express 服务器
const app = express()
//
const STATIC_PATH = './server'
//
const history = require('connect-history-api-fallback')
app.use(history())
//
// // 静态资源服务
const serveStatic = require('serve-static')
app.use(serveStatic(STATIC_PATH))
//
// // 跨域问题
const cors = require('cors')
app.use(cors())
//
// // 路由拦截
app.all('*', (req, res, next) => {
// console.log('路由：', req, res);
  next()
})
//
// 		/*--------------------------------------------------*/
const port = 20014
app.listen(port)
//
console.log(`

 ··································${new Date()}··································
 PORT: ${port}    Server is Running...
 ·····
 ·
 http://localhost:${port}
 server is starting ...
`)

/**
 *  * 异常机制
 *   */
app.on('error', (err) => {
  //err.stack
  console.log(`\n\n Express异常错误机制  \n ${err}  \n\n`)
})
