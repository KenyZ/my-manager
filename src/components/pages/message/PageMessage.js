
import React from 'react'
import {
    Route,
    Switch,
    Redirect,
    useRouteMatch
} from 'react-router-dom'

import MessageSidebar from './MessageSidebar'
import MessageChat from './MessageChat'

const PageMessage = () => {

    const {path, url} = useRouteMatch()
    
    return (
        <div className="page PageMessage">
            <MessageSidebar/>
            <div className="PageMessage-content">
                <Switch>
                    <Route exact path={path}>
                        <div>egregerg</div>
                    </Route>
                    <Route path={path + "/c/:chat"} component={MessageChat}/>
                    <Route path={path + "/*"} render={() => <Redirect to={path}/>}/>
                </Switch>
            </div>
        </div>
    )
}

export default PageMessage