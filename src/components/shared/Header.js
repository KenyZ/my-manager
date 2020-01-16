import React from 'react'
import {withRouter} from 'react-router-dom'
import { connect } from 'react-redux'

import RequestData from '../../utils/RequestData'
import {
    logOut,
    getUserAction
} from '../../store/actions/actions'

// Material UI
import {
    Button,
    withStyles,
} from '@material-ui/core'
import {red} from '@material-ui/core/colors'

const styles = {
    btn_logout: {
        color: red[400],
        marginLeft: "auto"
    }
}

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
    }

    disconnect(){
        this.props.logOut()
        this.props.history.push('/')
    }

    componentDidMount(){
        this.props.getUserAction()
    }
     
    render(){

        const {classes} = this.props

        return (
            <header className="Header">
                {(this.props.user) && <HeaderUserInfo user={this.props.user}/>}
                <Button
                    variant="text"
                    classes={{root: classes.btn_logout}}
                    onClick={this.disconnect}
                >
                    Log out
                </Button>
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

const mapDispatchToProps = dispatch => ({
    logOut: (...args) => dispatch(logOut(...args)),
    getUserAction: (...args) => dispatch(getUserAction(...args)),
})

export default connect(mapStateToProps, mapDispatchToProps)(
    withRouter(
        withStyles(styles)(Header)
    )
)