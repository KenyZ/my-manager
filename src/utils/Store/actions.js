

export const SET_TOKEN = "SET_TOKEN"
export const setTokenAccess = token => {
    return {
        type: SET_TOKEN,
        token: token
    }
}



export const LOG_OUT = "LOG_OUT"
export const logOut = () => {
    return {
        type: LOG_OUT
    }
}

export const SET_USER = "SET_USER"
export const setUser = user => {
    
    return {
        type: SET_USER,
        user
    }
}

export const SET_CHATS = "SET_CHATS"
export const setChats = ({chats}) => {
    
    return {
        type: SET_CHATS,
        chats
    }
}