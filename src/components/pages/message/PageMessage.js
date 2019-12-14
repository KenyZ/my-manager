
import React from 'react'
import {
    Route,
    Switch,
    Redirect,
    withRouter
} from 'react-router-dom'

import MessageSidebar from './MessageSidebar'
import MessageChat from './MessageChat'

class PageMessage extends React.Component{

    constructor(props){
        super(props)
    }
    
    render(){

        const { path } = this.props.match

        return (
            <div className="page PageMessage">
                <MessageSidebar/>
                <div className="PageMessage-content">
                    <Switch>
                        <Route exact path={path}>
                            <div className="PageMessage-home">
                                <div className="welcome">
                                    <h1>Welcome !</h1>
                                </div>
                            </div>
                        </Route>
                        <Route path={path + "/talk/:chat"} component={MessageChat}/>
                        <Route path={path + "/*"} render={() => <Redirect to={path}/>}/>
                    </Switch>
                </div>
            </div>
        )
    }
}

export default withRouter(PageMessage)