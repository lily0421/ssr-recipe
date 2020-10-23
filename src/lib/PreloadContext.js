import { createContext, useContext } from 'react'
//클라이언트 환경: null
//서버 환경: {done:false, promises:[]}
const PreloadContext = createContext(null)
export default PreloadContext

//resolve 는 함수타입
export const Preloader = ({ resolve }) => {
  const preloadContext = useContext(PreloadContext)
  if (!preloadContext) return null
  if (preloadContext.doen) return null
  preloadContext.promises.push(Promise.resolve(resolve()))
  // promise배열에 프로미스 등록. resolve반환안되도 프로미스 취급하깅 위해 Promise.resolve함수 사용
  return null
}
