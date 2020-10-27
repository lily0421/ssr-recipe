import React from 'react'
import ReactDOMServer from 'react-dom/server'
import express from 'express'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import path from 'path'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import rootReducer, {rootSaga} from './modules'
import preloadContext from './lib/PreloadContext'
import createSagaMiddleware from 'react-redux'
import {END} from 'redux-saga'

//asset-manifest.json파일 경로들 조회.
const statsFile = path.resolve('./build/loadable-stats.json')
function createPage(root, stateScript) {
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
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">
      ${root}
    </div>
    ${stateScript}
  </body>
  </html>
 `
}

const app = express()

const serverRender = async (req, res, next) => {
  //404가 떠야하는 상황에 서버사이드 렌더링 해줌
  const context = {}
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    rootReducer, 
    applyMiddleware(thunk, sagaMiddleware)
  )

  const sagaPromise = sagaMiddleware.run(rootSaga)
  const PreloadContext = {
    done: false,
    promises: [],
  }

  const jsx = (
    <PreloadContext.Provider value={PreloadContext}>
      <Provider store={store}>
        <StaticRouter location={req.url} context={context}>
          <App />
        </StaticRouter>
      </Provider>
    </PreloadContext.Provider>
  )
  ReactDOMServer.renderToString(jsx);
  store.dispatch(END)
  try{
    await sagaPromise
    await Promise.all(preloadContext.promises); //모든 프로미스 기다림
  } catch(e){
    return res.status(500);
  }
  preloadContext.done = true;
  const root = ReactDOMServer.renderToString(jsx) //렌더링 하고
  //JSON을 문자열로 변환하고 악성 스크립트가 실행되는 것을 방지하기 위해 <를 치환처리
  const stateString = JSON.stringify(store.getState()).replace(/</g, '\\u003c')
  const stateScript = `<script>__PRELOADED_STATE__=${stateString}</script>` //리덕스 초기상태를 스크립트로 주입
  res.send(createPage(root, stateScript)) //클라이언트에게 결과물 응답
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
