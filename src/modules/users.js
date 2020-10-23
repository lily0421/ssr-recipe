import axios from 'axios'

//액션타입 정의
const GET_USERS_PENDING = 'users/ GET_USERS_PENDING'
const GET_USERS_SUCCESS = 'users/ GET_USERS_SUCCESS'
const GET_USERS_FAILURE = 'users/ GET_USERS_FAILURE'

const getUsersPending = () => ({ type: GET_USERS_PENDING })
const getUsersSuccess = (payload) => ({ type: GET_USERS_SUCCESS })
const getUsersFailure = (payload) => ({
  type: GET_USERS_FAILURE,
  error: true,
  payload,
})

export const getUsers = () => async (dispatch) => {
  try {
    dispatch(getUsersPending())
    const response = await axios.get(
      'https://jsonplaceholder.typicode.com/users',
    )
    dispatch(getUsersSuccess(response))
  } catch (e) {
    dispatch(getUsersFailure(e))
    throw e
  }
}

//모듈 타입 (갹체)- redux-saga사용한 서버사이드 렌더링 방법 연습시, 단 하나의 사용자 정보를 가져오는 다른 다른 API 호출할 것이기 때문
const inititalState = {
  users: null,
  user: null,
  loading: { users: false, user: false }, //API가 한개 이상이므로 각 값에 하나하나 이름 지어주는 대신, loading객체에 넣음
  error: {
    users: null,
    user: null,
  },
}

function users(state = inititalState, action) {
  switch (action.type) {
    case GET_USERS_PENDING:
      return { ...state, loading: { ...state.loading, users: true } }
    case GET_USERS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, users: false },
        users: action.payload.data,
      }
    case GET_USERS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, users: false },
        error: { ...state.error, users: action.payload },
      }
    default:
      return state
  }
}

export default users
