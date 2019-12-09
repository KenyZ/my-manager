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
import {useRequestedData} from '../shared/hooks'
import RequestData from '../../utils/RequestData'

const HeaderUserInfo = ({user}) => {

    return (
        <React.Fragment>
            <div className="Header-avatar">
                <img src={user.avatar} alt=""/>
            </div>
            <p className="Header-username">@{user.username}</p>
        </React.Fragment>
    )
}

const Header = () => {

    const {state: appStore, dispatch: appStoreDispatcher} = useContext(StoreContext)
    const history = useHistory()

    const disconnect = () => {

        AppStorage.set('token', null)
        appStoreDispatcher(logOut())
        history.push('/')
    }


    const fetchUserInfo = () => {
        return RequestData.getUserInfo(appStore.token)
    }

    const receivedUserInfo = user => {
        appStoreDispatcher(setUser(user))
    }

    const {} = useRequestedData(fetchUserInfo, receivedUserInfo)
    
    return (
        <header className="Header">
            {(appStore.user) && <HeaderUserInfo user={appStore.user}/>}
            <button onClick={disconnect} className="Header-logout">LOG OUT</button>
        </header>
    )
}

export default Header