import * as ActionTypes from './actions.types'
import StorageManager from '../../utils/StorageManager'
import Utils from '../../utils/Utils'

export const updateAccessToken = (token = null) => {

    StorageManager.set("access_token", token)

    return {
        type: ActionTypes.UPDATE_ACCESS_TOKEN,
        token: null
    }
}


export const updateIsAuthenticated = (isAuthenticated = false) => {

    return {
        type: ActionTypes.UPDATE_IS_AUTHENTICATED,
        isAuthenticated
    }
}

export const logOut = () => {

    StorageManager.set("access_token", null)
    return {
        type: ActionTypes.LOG_OUT
    }    
}

export const setUser = user => {
    return {
        type: ActionTypes.SET_USER,
        user,
    }
}

export const getUserAction = () => {
    return dispatch => {
        return Utils.requestApi('/user?info=43', {
            method: 'GET',
            headers: {
                'x-auth-token': StorageManager.get('access_token')  
            }
        }).then(response => {

            if(response.body.error){
                return null
            }
            return response.body.data.user
        }).then(response => {
            dispatch(setUser(response))
        })
    }
}

export const createUser = (user = null) => {

    return {
        type: ActionTypes.CREATE_USER,
        user: user
    }
}

export const updateUser = (user_id, updatedData = {}) => {

    return {
        type: ActionTypes.UPDATE_USER,
        user_id,
        updatedData,
    }
}

export const signIn = (token = null, rememberme = false) => {

    if(rememberme) {
        StorageManager.set("access_token", token)
    }

    return {
        type: ActionTypes.SIGN_IN,
        accessToken: token
    }
}