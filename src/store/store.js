import {createStore, applyMiddleware} from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers'
import StorageManager from '../utils/StorageManager'


const hydrateStore = initialState => {

    return {
        ...initialState,
        accessToken: StorageManager.get("access_token") || null
    }
}

const initialState = hydrateStore({

    isAuthenticated: false,

    header: true,

    accessToken: null,

    user: null,

    contacts: [],
    
    chats: [],

    users: {}


})

export default createStore(
    reducers(initialState),
    initialState,
    applyMiddleware(
        thunkMiddleware
    ),
)