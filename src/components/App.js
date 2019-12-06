import React, {
} from 'react'
import {
    Switch,
    Route,
    Redirect,
    useLocation,
} from 'react-router-dom'

import '../style/style.scss'
import PageMessage from './pages/message/PageMessage'
import PageLogin from './pages/PageLogin'

import ProtectedRoute from './shared/ProtectedRoute'
import Header from './shared/Header'
import PageHome from './pages/PageHome'


const pagesWithNoHeader = [
    '/login'
]

const App = () => {

    const location = useLocation()

    return (
        <div className="App">

            {!pagesWithNoHeader.includes(location.pathname) && <Header/>}

            <Switch>
                <Route exact path="/" component={PageHome}/>
                <Route path="/login" component={PageLogin}/>
                <ProtectedRoute path="/messages" component={PageMessage}/>
                <Route path="*" render={() => <Redirect to="/"/>}/>
            </Switch>
        </div>
    )
}

export default App