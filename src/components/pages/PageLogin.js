import React, {} from 'react'
import {
    withRouter
} from 'react-router-dom'
import { connect } from 'react-redux'

import Constants from '../../utils/Constants'
import RequestData from '../../utils/RequestData'
import {
    signIn,
} from '../../store/actions/actions'

import MaterialStyles from '../../utils/MaterialStyles'

/** Material UI */
import {
    TextField,
    Button,
    withStyles,
    makeStyles,
    FormControl,
    Typography,
    Checkbox,
    FormControlLabel
} from '@material-ui/core'


const styles = {
    btn_success: {
        marginTop: 16
    },

    form_title: {
        fontSize: 32,
        textAlign: "center"
    }
}


const LoginFormError = {
    [Constants.API_ERRORS.USER_NOT_FOUND]: 'Username or password is wrong.'
}


class PageLogin extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            formError: false,
            inputs: {
                signin_rememberme: true
            }
        }

        this.onSubmit = this.onSubmit.bind(this)
        this.handleFormChange = this.handleFormChange.bind(this)
    }

    onSubmit(e){
        e.preventDefault()

        const form = {
            login: this.state.inputs.signin_login || "",
            password: this.state.inputs.signin_password || "",
            rememberme: this.state.inputs.signin_rememberme || "",
        }

        RequestData.login(form)
        .then(data => {
            if(data){
                  
                this.props.signIn(data.token, form.rememberme)
                this.props.history.push('/messages')
            }
        })
            .catch(FormError => {
                console.log({FormError})
            this.setState({
                formError: LoginFormError[FormError] || 'An error has occured.'
            })
        })
    }   


    handleFormChange(event){
        const {id, value, type, checked = false} = event.target

        if(type && type === "checkbox"){

            this.setState({
                inputs: {
                    ...this.state.inputs,
                    [id]: checked
                }
            })
        } else {
            this.setState({
                inputs: {
                    ...this.state.inputs,
                    [id]: value
                }
            })
        }
    }


    render(){

        const {classes} = this.props

        return ( 
                <div className="page PageLogin">
                    <div className="PageLogin-form">
                        <div className="PageLogin-logo">my-manager</div>
                        <form id="login_form" className="Form">

                            <Typography
                                classes={{root: classes.form_title}}
                            >
                                Sign in
                            </Typography>

                            <TextField 
                                id="signin_login" 
                                label="Username"
                                fullWidth={true}
                                variant="outlined"
                                size="small"
                                margin="normal"
                                required={true}
                                onChange={this.handleFormChange}
                                error={this.state.formError}
                                helperText={this.state.formError}
                                autoFocus={true}
                            />

                            <TextField 
                                id="signin_password" 
                                label="Password"
                                fullWidth={true}
                                variant="outlined"
                                size="small"
                                margin="normal"
                                required={true}
                                onChange={this.handleFormChange}
                                error={this.state.formError}
                                helperText={this.state.formError}
                                type="password"
                            />

                            <FormControlLabel
                                label="Remember me"
                                control={
                                    <Checkbox
                                        id="signin_rememberme"
                                        checked={this.state.inputs.signin_rememberme || false}
                                        onChange={this.handleFormChange}
                                        color="primary"
                                        error={this.state.formError}
                                    />
                                }
                            />

                            <Button
                                type="submit"
                                color="primary"
                                variant="contained"
                                margin="normal"
                                classes={{contained: classes.btn_success}}
                                onClick={this.onSubmit}
                                fullWidth={true}
                            >
                                Sign in
                            </Button>
                            {/* <div className="PageLogin-form-title">Welcome !</div>
        
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
        
                            <button onClick={this.submitForm} className="Form-btn-submit" type="submit">SIGN IN</button> */}
        
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
        withStyles(styles)(PageLogin)
    )
)