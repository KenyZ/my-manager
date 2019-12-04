import React, {
    useReducer
} from 'react'

import AppStorage from '../AppStorage'

const hydrateWith = (hydrater, prevState) => {
    for(let key in prevState){
        if(typeof hydrater[key] !== 'undefined' && hydrater[key] !== null){
            prevState[key] = hydrater[key]
        }
    }

    return hydrater
}

const initialState = {
    token: null,
    auth: false,
    user: null,
    chats: [],
    ...AppStorage.get(),
}

export default initialState