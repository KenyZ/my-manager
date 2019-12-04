
import React, {useReducer} from 'react'

import {mainReducer} from './reducers'
import Store from './Store'
import StoreContext from './StoreContext'

const StoreProvider = ({children}) => {

    const [state, dispatch] = useReducer(mainReducer, Store)

    return (
        <StoreContext.Provider value={{state, dispatch}}>
            {children}
        </StoreContext.Provider>
    )
}

export default StoreProvider