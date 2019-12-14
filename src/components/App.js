import React, {
} from 'react'
import {
    Switch,
    Route,
    Redirect,
    withRouter,
} from 'react-router-dom'
import {
    connect
} from 'react-redux'

import '../style/style.scss'

import PageMessage from './pages/message/PageMessage'
import PageLogin from './pages/PageLogin'
import ProtectedRoute from './shared/ProtectedRoute'
import Header from './shared/Header'
import PageHome from './pages/PageHome'

class App extends React.Component{

    constructor(props){
        super(props)
    }

    render(){

        const { location } = this.props

        return (
            <div className="App">
    
                {this.props.isAuthenticated && this.props.header && <Header/>}
    
                <Switch>
                    <Route exact path="/" component={PageHome}/>
                    <Route path="/login" component={PageLogin}/>
                    <ProtectedRoute path="/messages" component={PageMessage}/>
                    <Route path="*" render={() => <Redirect to="/"/>}/>
                </Switch>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        header: state.header,
        isAuthenticated: state.isAuthenticated,
    }
}

const mapDispatchToProps = dispatch => {
    return {

        
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App))