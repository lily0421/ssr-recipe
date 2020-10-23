# 프로젝트 작업 순서
- 서버사이드 렌더링 구현
- 데이터 로딩
- 코드스플리팅

## 설명
- page 폴더
각 라우트를 위한 페이지 컴포넌트들
 
- 웹팩 환경 설정 파일 작성 
> >config/webpack.config.server.js
기본: 빌드할 때 어떤 파일에서 시작해 파일들을 불러오는지, 어디에 결과물 저장할지 정해둠

## 서버 사이드 렌더링 구현
- 설치 react-router-dom
```
yarn add react-router-dom
```
- 서버 사이드 렌더링 구현
=> 웹팩 설정을 커스터마이징 해주어야 함. ) git에 올려놓고 다음으로 넘어가는 것이 좋음
=> CRA로 만든 프로젝트는 웹팩 관련 설정이 기본적으로 모두 숨겨져 있음 ) yarn eject로 밖으로 꺼냄

- 서버 사이드 렌더링용 엔트리
=> 엔트리?
> >웹팩에서 프로젝트 불러올 때 가장 먼저 불러오는 파일
=> 서버를 위한 엔트리 파일을 따로 생성해야 함 ) index.server.js
```javascript
import ReactDomServer from 'react-dom/server';
```
서버에서 리액트 컴포넌트 렌더링시 ) ReactDOMSever의 renderToString 함수 사용.
ReactDomServer.renderToString()

엔트리 파일 웹팩으로 불러와 빌드시,서버 전용 환경 설정 만들어야 함   
> config - paths.js
```javascript
ssrIndexJs: resolveApp('src/index.server.js'), // 서버사이드 렌더링 엔트리(불러올 파일 경로)
ssrBuild: resolveApp('dist'), // 웹팩 처리 후 저장 경로(웹팩으로 처리한 뒤 결과물 저장할 경로)
```

> config/webpack.config.server.js
```javascript
resolve: {
  modules: ['node_modules']
} 
```
react, react-dom/server라이브러리 import구문으로 불러오면 node_modules에서 찾아 사용함
라이브러리 불러오면 빌드시 파일 안에 해당 라이브러리 관련 코드가 함께 번들링 됨

- webpack-node-externals 라이브러리
서버를 위해 번들링 시, node_modules에서 불러오는 것 제외하고 번들링하는것이 좋기 때문에, 설치
```
yarn add webpack-node-externalsd
```
사용) 
```javascript
const nodeExternals = require('webpack-node-externals');
externals: [nodeExternals()]
```

환경변수 주입
```javascript
const webpack = require('webpack');
const getClientEnvironment = require('./env');//환경변수 주입

const env = getClientEnvironment(paths.publicUrlOrPath.slick(0,-1));

plugins: [
  new webpack.DefinePlugin(env.stringified) //환경변수 주입
]
```
프로젝트 내에서 process.env.NOED_ENV값 참조해 현재 개발환경인지 아닌지를 확인

- 빌드 스크립트 작성
scripts/build.server.js
=> node scripts/build.server.js
=> node dist/server.js

- package.json - scripts부분
```
"start:server": "node dist/server.js",
"build:server": "node scripts/build.server.js"
```

### 서버코드 작성
- Node.js 웹 프레임워크) Express사용
```
yarn add express
```
 
### 정적 파일 제공
- yarn build
js와 css파일을 불러오도록 html애 코드를 삽입해주어야 함.
불러와야하는 파일 이름은 매번 다름 => 빌드 후 build/asset-manifest.json파일 참고해 불러옴

- index.server.js
build/asset-manifest.json
=> main.css , main.js, runtime~main.js, static/js/2.2530d60c.chunk.js 
=> 불러와야 함


## 데이터 로딩
- redux-thunk 
```
yarn add redux react-redux redux-thunk axios
```
- Ducks 패턴 사용
액션타입, 액션생성함수, 리듀서 코드 => 한 파일에 넣어 관리