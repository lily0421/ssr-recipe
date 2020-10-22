const paths = require('./paths');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent'); //css module의 고유 className만들 때 필요한 옵션
const webpack = require('webpack');
const getClientEnvironment = require('./env');//환경변수 주입


const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const nodeExternals = require('webpack-node-externals'); // 환경설정 파일

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

module.exports = {
  mode: 'production', //프로덕션 모드로 설정하여 최적화 옵션들을 활성화
  entry: paths.ssrIndexJsJs, //엔트리 경로
  target: 'node',//node환경에서 실행될 것이라는 점 명시
  output: {
    path: paths.ssrBuild,//빌드경로
    filename: 'server.js',//파일이름
    chunkFilenmae: 'js/[name].chunk.js',//청크파일 이름
    publicPath: paths.publicUrlOrPath,//정적파일이 제공될 경로
  },
  module:{
    rules: [
      {
        oneOf: [
          //js를 위한 처리
          //기존 webpack.config.js를 참고해 작성
          {
            text: /\.(js|mjs|jsx|ts|tsx)$/,
            onclude: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              cutomize: require.resolve(
                'babel-preset-react-app/webpack-overrides'
              ),
              plugins: [
                [
                  require.resolve('babel-plugin-named-asset-import'),
                  {
                    loaderMap:{
                      svg: {
                        ReactComponet: '@svgr/sebpack?-svgo![path]'
                      }
                    }
                  }
                ]
              ],
              cacheDirectory: true,
              cacheCompression: false,
              compat: false
            }
          },
          //css를 위한 처리
          {
            test: cssRegex,
            exclude: cssModuleRegex,
            //exportOnlyLocals: true옵션을 설정해야 실제css파일을 생성하지 않음
            loader: require.resolve('css-loader'),
            options: {
              onlyLocals: true
            }
          },
          //css module을 위한 처리
          {
            test: cssModuleRegex,
            loader: require.resolve('css-loader'),
            options: {
              modules:true,
              onlyLocals: true,
              getLocalIdent: getCSSModuleLocalIdent
            }
          },
          //sass를 위한 처리
          {
            test: sassRegex,
            exclude: sassModuleRegex,
            use: [
              {
                loader: require.resolve('css-loader'),
                options: {
                  onlyLocals: true
                }
              },
              require.resolve('sass-loader')
            ]
          },
          //sass+ css 모듈 위한 처리
          {
            test: sassRegex,
            exclude: sassModuleRegex,
            use: [
              {
                loader: require.resolve('css-loader'),
                options: {
                  modules: true,
                  onlyLocals: true,
                  getLocalIdent: getCSSModuleLocalIdent
                }
              },
              require.resolve('sass-loader')
            ]
          },
          //url-loader위한 설정
          {
            test: [/\.bmp$/, /\.gif$/,/\.jpe?g$/,/\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              emitFile: false, //파일을 따로 저장히자 않는 옵션
              limit: 1000, //원래는 9.76kb가 넘어가면 파일로 저장하는데 emitFile값이 f일때는 경로만 준비하고 파일은 저장하지 않음
              name: 'static/media/[name].[hash:8].[ext]'
            }
          },
          //위에서 설정된 확장자를 제외한 파일들 => file.loader사용함
          {
            loader: require.resolve('file-loader'),
            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            options: {
              emitFile: false,
              name: 'statc/medai/[name].[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    modules: ['node_modules']
  },
  externals: [nodeExternals()],
  plugins: [
    new webpack.DefinePlugin(env.stringified) //환경변수 주입
  ]
}