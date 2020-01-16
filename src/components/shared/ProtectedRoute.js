import React from 'react'
import {
    Route,
    Redirect,
} from 'react-router-dom'
import { connect } from 'react-redux'

import {
    updateIsAuthenticated
} from '../../store/actions/actions'
import RequestData from '../../utils/RequestData'

class ProtectedRoute extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            loading: true,
            auth: false
        }
        this.tryToAuthenticate = this.tryToAuthenticate.bind(this)
    }

    tryToAuthenticate(){
        RequestData.checkAuthentication().then(isAuthenticated => {
            this.setState({
                loading: false,
                auth: isAuthenticated
            })

            this.props.updateIsAuthenticated(isAuthenticated)
        })
    }

    componentDidMount(){
        this.tryToAuthenticate()
    }

    render(){

        const {component: Component, ...rest} = this.props

        if(this.state.loading){
            return <Route {...rest} render={() => {
                return <div>...loading</div>
            }}/>
        } else {
    
            if(this.state.auth){
                return <Route {...rest} component={Component} />
    
            } else {
                return <Redirect to="/login" />
            }
        }
    }

}


const mapStateToProps = state => {
    return {
        accessToken: state.accessToken
    }
}

const mapDispatchToProps = dispatch => ({
    updateIsAuthenticated: (...args) => dispatch(updateIsAuthenticated(...args)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProtectedRoute)