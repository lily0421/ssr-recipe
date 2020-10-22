import React from 'react';
import ReactDomServer from 'react-dom/server';

const html = ReactDomServer.renderToString(
  <div data-reactroot=""> Hello Server Side Rendering!</div>
);

console.log(html);
