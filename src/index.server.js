import React from 'react';
import ReactDomServer from 'react-dom/server';
import express from 'express';
import {StaticRouter, staticRouter} from 'react-router-dom';
import App from './App';

const app = express();

const serverRender = (req, res, next) => {
  const context={};
  const jsx = (
    <StaticRouter location={req.url} contex={context}>
      <App />
    </StaticRouter>
  )
  const root = ReactDomServer.renderToString(jsx);
}

app.use(serverRender);

app.listen(5000, ()=>{
  console.log('5000에서 running')
})