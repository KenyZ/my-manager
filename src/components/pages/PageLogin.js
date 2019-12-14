import React, {} from 'react'
import {
    withRouter
} from 'react-router-dom'
import { connect } from 'react-redux'

import Constants from '../../utils/Constants'
import RequestData from '../../utils/RequestData'
import StorageManager from '../../utils/StorageManager'
import {
    signIn,
} from '../../store/actions/actions'

const LoginFormError = {
    [Constants.API_ERRORS.USER_NOT_FOUND]: 'Username or password is wrong.'
}


class PageLogin extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            formError: false
        }
        this.submitForm = this.submitForm.bind(this)
        this.form = React.createRef(null)
    }

    submitForm(e){
        e.preventDefault()

        const form = this.form.current

        const requestBody = {
            username: form.username.value || "",
            password: form.password.value || "",
        }

        const rememberme = form.rememberme.checked

        RequestData.login(requestBody)
        .then(data => {
            if(data){
                  
                this.props.signIn(data.token, rememberme)
                this.props.history.push('/messages')
            }
        })
        .catch(FormError => {
            this.setState({
                formError: LoginFormError[FormError] || 'An error has occured.'
            })
        })
    }   


    render(){

        return ( 
                <div className="page PageLogin">
                    <div className="PageLogin-form">
                        <div className="PageLogin-logo">my-manager</div>
                        <form ref={this.form} id="login_form" className="Form">
                            <div className="PageLogin-form-title">Welcome !</div>
        
                            {this.state.formError && (
                            <ul className="Form-errors">
                                <li className="Form-errors-item">{this.state.formError}</li>
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
        
                            <button onClick={this.submitForm} className="Form-btn-submit" type="submit">SIGN IN</button>
        
                        </form>
                    </div>
                </div>
        )
    }
}

const mapStateToProps = state => {
    return {

    }
}

const mapDispatchToProps = dispatch => {
    return {
        signIn: (token, rememberme) => dispatch(signIn(token, rememberme))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withRouter(
        PageLogin
    )
)