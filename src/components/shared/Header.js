import React, {
    useContext,
    useEffect,
    useState
} from 'react'
import {useHistory} from 'react-router-dom'

import StoreContext from '../../utils/Store/StoreContext'
import {
    logOut,
    setUser
} from '../../utils/Store/actions'
import AppStorage from '../../utils/AppStorage'
import Utils from '../../utils/Utils'

const Header = () => {

    const {state: appStore, dispatch: appStoreDispatcher} = useContext(StoreContext)
    const history = useHistory()
    const [loading, isLoading] = useState(true)

    const disconnect = () => {

        AppStorage.set('token', null)
        appStoreDispatcher(logOut())
        history.push('/')
    }

    const requestUserInfo = () => {
        Utils.requestApi('/user', {
            body: {
                token: appStore.token
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            appStoreDispatcher(setUser(response.body.data.user))
        })
    }

    useEffect(requestUserInfo, [])
    useEffect(() => {
        isLoading(appStore.user === null)
    }, [appStore.user])

    const HeaderUserInfo = () => {
        return (
            <React.Fragment>
                <div className="Header-avatar">
                    <img src={appStore.user.avatar} alt=""/>
                </div>
                <p className="Header-username">@{appStore.user.username}</p>
            </React.Fragment>
        )
    }

    return (
        <header className="Header">^
            {!loading && <HeaderUserInfo/>}
            <button onClick={disconnect} className="Header-logout">LOG OUT</button>
        </header>
    )
}

export default Header