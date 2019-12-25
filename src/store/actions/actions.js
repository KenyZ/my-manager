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


export const SET_CONTACTS = "SET_CONTACTS"
export const setContacts = contacts => {
    return {
        type: SET_CONTACTS,
        contacts
    }
}

export const ADD_CONTACT = "ADD_CONTACT"
export const addContact = contact => {
    console.log({
        contact,
        hey: 'yooo'
    })
    return {
        type: ADD_CONTACT,
        contact
    }
}

export const SET_CHATS = "SET_CHATS"
export const setChats = chats => {
    return {
        type: SET_CHATS,
        chats
    }
}

export const SET_MESSAGES = "SET_MESSAGES"
export const setMessages = messages => {
    return {
        type: SET_MESSAGES,
        messages
    }
}
