
import React from 'react'
import {
    Route,
    Switch,
    Redirect,
    withRouter
} from 'react-router-dom'
import socketIOClient from "socket.io-client"
import { connect } from 'react-redux'

import MessageSidebar from './MessageSidebar'
import MessageChat from './MessageChat'
import StorageManager from '../../../utils/StorageManager'


import {
    updateUser,
    sendMessage,
    addMessage
} from '../../../store/actions/actions'

class PageMessage extends React.Component{

    constructor(props){
        super(props)

        this.submitMessage = this.submitMessage.bind(this)
    }

    submitMessage(user_id, text){
        return new Promise((resolve, reject) => {
            if(this.socket){
                this.socket.emit("send_message", user_id, text, creatingMessageHasSucceed => {
                    if(creatingMessageHasSucceed){
                        resolve()
                    } else {
                        reject()
                    }
                })            
            } else {
                reject()
            }
        })
    }

    componentDidMount(){
        this.socket = socketIOClient("http://localhost:3001/messages")

        this.socket.emit("is_connected", {
            access_token: StorageManager.get('access_token')
        })

        this.socket.on("has_entered", user_id => {
            console.log(user_id + " has entered")

            this.props.updateUser(user_id, {
                is_connected: true
            })
        })


        this.socket.on("has_leave", user_id => {
            console.log(user_id + " has leave")

            this.props.updateUser(user_id, {
                is_connected: false
            })
        })
        
        this.socket.on("receive_message", message => {
            console.log("has received message", message)
            this.props.addMessage(message)
        })

    }

    componentWillUnmount(){
        this.socket.emit('disconnect')
        this.socket.off()
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
                        <Route path={path + "/t/:chat"}>
                            <MessageChat submitMessage={this.submitMessage}/>
                        </Route>
                        <Route path={path + "/*"} render={() => <Redirect to={path}/>}/>
                    </Switch>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {

    }
}

const mapDispatchToProps = dispatch => ({
    updateUser: (...args) => dispatch(updateUser(...args)),
    sendMessage: (...args) => dispatch(sendMessage(...args)),
    addMessage: (...args) => dispatch(addMessage(...args)),
})

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(PageMessage)
)