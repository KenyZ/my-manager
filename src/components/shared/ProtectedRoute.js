import React, {
    useContext,
    useState
} from 'react'
import {
    Route,
    Redirect,
} from 'react-router-dom'

import StoreContext from '../../utils/Store/StoreContext'
import { requestApi } from '../../utils/Utils'

const ProtectedRoute = ({component: Component, ...rest}) => {

    const  {state: appStore} = useContext(StoreContext)
    const [loading, setLoading] = useState(true)
    const [auth, setAuth] = useState(false)

    const token = appStore.token


    requestApi('authenticate', {
        body: {
            token
        }
    }).then(response => {

        if(response.body.error){
            return
        }

        setAuth(response.body.data.access)
        setLoading(false)
    })

    if(loading){
        return <Route {...rest} render={() => {
            return <div>...loading</div>
        }}/>
    } else {

        if(auth){
            return <Route {...rest} component={Component} />

        } else {
            return <Redirect to="/login" />
        }
    }

}

export default ProtectedRoute