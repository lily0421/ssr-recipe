import React from 'react'
import ReactDomServer from 'react-dom/server'
import express from 'express'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import path from 'path'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import rootReducer from './modules'
import PreloadContext from './lib/PreloadContext'

//asset-manifest.json파일 경로들 조회.
const statsFile = path.resolve('./build/loadable-stats.json')
function createPage(root, tags) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,shrink-to-fit=no"
    />
    <meta name="theme-color" content="#000000" />
    <title>React App</title>
    ${tags.styles}
    ${tags.links}
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">
      ${root}
    </div>
    ${tags.scripts}
  </body>
  </html>
 `
}

const app = express()

const serverRender = (req, res, next) => {
  //404가 떠야하는 상황에 서버사이드 렌더링 해줌
  const context = {}
  const store = createStore(rootReducer, applyMiddleware(thunk))

  const preloadContext = {
    done: false,
    promises: [],
  }
  const jsx = (
    <PreloadContext.Provider value={preloadContext}>
      <Provider store={store}>
        <StaticRouter location={req.url} context={context}>
          <App />
        </StaticRouter>
      </Provider>
    </PreloadContext.Provider>
  )

  ReactDomServer.renderToStaticMarkup(jsx)
  try {
    await Promise.all(preloadContext.promises); 
  }catch(e){
    return res.status(500)
  }
  preloadContext.done=true;
  const root = ReactDomServer.renderToString(jsx) //렌더링 하고
  // res.send(root);//클라이언트에게 결과물 응답
  res.send(createPage(root))
}

const server = express.static(path.resolve('./build'), {
  index: false, //"/" 경로에서 index.html 보여주지 않도록 설정
})

app.use(server) //순서중요!! serverRender전에 위치
app.use(serverRender)

//5000 포트로 서버를 가동함
app.listen(5000, () => {
  console.log('5000에서 running')
})
