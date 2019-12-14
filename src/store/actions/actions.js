import StorageManager from '../../utils/StorageManager'

export const UPDATE_IS_AUTHENTICATED = "UPDATE_IS_AUTHENTICATED"
export const updateIsAuthenticated = (isAuthenticated = false) => {
    return {
        type: UPDATE_IS_AUTHENTICATED,
        isAuthenticated
    }
}


export const TOGGLE_HEADER_STATE = "TOGGLE_HEADER_STATE"
export const toggleHeaderState = (headerState = false) => {
    return {
        type: ENABLE_HEADER,
        header: headerState
    }
}


export const UPDATE_ACCESS_TOKEN = "UPDATE_ACCESS_TOKEN"
export const updateAccessToken = (token = null) => {

    StorageManager.set("access_token", token)

    return {
        type: UPDATE_ACCESS_TOKEN,
        token: null
    }
}

export const LOG_OUT = "LOG_OUT"
export const logOut = () => {
    StorageManager.set("access_token", null)
    return {
        type: LOG_OUT
    }
}

export const SIGN_IN = "SIGN_IN"
export const signIn = (token = null, rememberme = false) => {
    console.log({rememberme})
    if(rememberme) {
        StorageManager.set("access_token", token)
    }
    return {
        type: SIGN_IN,
        accessToken: token
    }
}

export const SET_USER = "SET_USER"
export const setUser = ({username, avatar}) => {
    return {
        type: SET_USER,
        username,
        avatar
    }
}
