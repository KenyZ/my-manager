import {createStore} from 'redux'

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

    contacts: []


})

export default createStore(
    reducers(initialState),
    initialState
)