import React from 'react'
import {withRouter} from 'react-router-dom'
import { connect } from 'react-redux'

import RequestData from '../../utils/RequestData'
import {
    logOut,
    setUser
} from '../../store/actions/actions'

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

class Header extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            user: {
                loading: true,
                data: null
            }
        }
        this.disconnect = this.disconnect.bind(this)
        this.fetchUserInfo = this.fetchUserInfo.bind(this)
    }

    disconnect(){
        this.props.logOut()
        this.props.history.push('/')
    }

    fetchUserInfo(){

        return RequestData.getUserInfo(this.props.accessToken).then(user => {

            this.props.setUser(user)
        })
    }

    componentDidMount(){
        this.fetchUserInfo()
    }
     
    render(){

        return (
            <header className="Header">
                {(this.props.user) && <HeaderUserInfo user={this.props.user}/>}
                <button onClick={this.disconnect} className="Header-logout">LOG OUT</button>
            </header>
        ) 
    }
}

const mapStateToProps = state => {
    return {
        accessToken: state.accessToken,
        user: state.user
    }
}

const mapDispatchToProps = dispatch => {
    return {
        logOut: () => dispatch(logOut()),
        setUser: user => dispatch(setUser(user))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withRouter(
        Header
    )
)