import React, {
    useContext,
    useState
} from 'react'
import {
    useHistory
} from 'react-router-dom'
import Utils from '../../utils/Utils'

import StoreContext from '../../utils/Store/StoreContext'
import {setTokenAccess} from '../../utils/Store/actions'
import Constants from '../../utils/Constants'
import AppStorage from '../../utils/AppStorage'

const LoginFormError = {
    [Constants.API_ERRORS.USER_NOT_FOUND]: 'Username or password is wrong.'
}

const PageLogin = () => {

    const {state: appStore, dispatch: appStoreDispatcher} = useContext(StoreContext)
    const [formError, setError] = useState(false)
    const history = useHistory()

    const submitForm = (e) => {
        e.preventDefault()

        const form = document.getElementById('login_form')
        const requestBody = {
            username: form.username.value || "",
            password: form.password.value || "",
        }

        const rememberme = form.rememberme.checked


        Utils.requestApi('login', {
            body: requestBody
        })
        .then(response => {
            console.log(response)

            if(response.body.error){

                setError(LoginFormError[response.body.error] || 'An error has occured.')
                return
            }

            if(response.body.data && response.body.data.token){

                appStoreDispatcher(setTokenAccess(response.body.data.token))

                if(rememberme){
                    AppStorage.set('token', response.body.data.token)
                }

                history.push('/messages')
            }
        })
    }

    return (
        <div className="page PageLogin">

            <div className="PageLogin-form">
                <div className="PageLogin-logo">my-manager</div>
                <form id="login_form" className="Form">
                    <div className="PageLogin-form-title">Welcome !</div>

                    {formError && (
                    <ul className="Form-errors">
                        <li className="Form-errors-item">{formError}</li>
                    </ul>)}

                    <div className="PageLogin-form-group">
                        <label htmlFor="username">USERNAME</label>
                        <input type="text" name="username" id="username" placeholder="Type your username"/>
                    </div>

                    <div className="PageLogin-form-group">
                        <label htmlFor="password">PASSWORD</label>
                        <input type="password" name="password" id="password" placeholder="Type your password"/>
                    </div>

                    <div className="Form-check">
                        <label htmlFor="rememberme">Remember me</label>
                        <input type="checkbox" name="rememberme" id="rememberme"/>
                    </div>

                    <button onClick={submitForm} className="Form-btn-submit" type="submit">SIGN IN</button>

                </form>
            </div>
        </div>
    )
}

export default PageLogin