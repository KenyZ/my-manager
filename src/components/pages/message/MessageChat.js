import React from 'react'
import PropTypes from 'prop-types'
import {
    withRouter
} from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import Utils from '../../../utils/Utils'
import RequestData from '../../../utils/RequestData'

import { getChatAction} from '../../../store/actions/actions'
 
const MessageGroup = ({group}) => {
    
    return (
        <div className="PageMessage-chat-list-item_group">
            {
                group.map(({author, isReceived, createdAt, text}, messageItemIndex) => {
                    

                    return (
                        <MessageItem 
                            key={"message-item-" + messageItemIndex}
                            author={author}
                            isReceived={isReceived}
                            createdAt={createdAt}
                            text={text}
                        />
                    )
                })
            }
        </div>
    )
}

const MessageItem = ({author, isReceived, createdAt, text}) => {
    return (
        <div className={"PageMessage-chat-list-item MessageItem" + (isReceived == true ? " is-received" : "")}>
            <div className="MessageItem-header">
                <div className="MessageItem-header-avatar">
                    <img src={author.avatar} alt=""/>
                </div>
                {/* <span className="MessageItem-header-username">{username}</span> */}
                <div className="MessageItem-header-date">{createdAt.text}</div>
            </div>
            <div className="MessageItem-body">
                <p>
                    {text}
                    <span className="date">{createdAt.text}</span>
                </p>
            </div>
        </div>
    )
}

MessageItem.propTypes = {
    author: PropTypes.shape({
        avatar: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
    }).isRequired,
    createdAt: PropTypes.shape({
        date: PropTypes.instanceOf(moment).isRequired,
        text: PropTypes.string.isRequired
    }).isRequired,
    text: PropTypes.string.isRequired
}

class PageChat extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            chatLoading: true,
            chatId: null,
        }

        this.messagesListRef = React.createRef(null)
        this.messageInputRef = React.createRef(null)

        this.initListScroll = this.initListScroll.bind(this)
        this.getMessagesAsGroups = this.getMessagesAsGroups.bind(this)
        this.retrieveUserFromStore = this.retrieveUserFromStore.bind(this)
        this.onChatChange = this.onChatChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.fetchChat = this.fetchChat.bind(this)
    }


    initListScroll(){

        if(this.messagesListRef.current){            

            const scroll = this.messagesListRef.current.scrollHeight - this.messagesListRef.current.offsetHeight
            this.messagesListRef.current.scrollTop = scroll + 10
        }

    }

    getMessagesAsGroups(messages = []){

        return messages.length === 0 ? [] : Utils.linkBy(messages, (c, p) => {

            let diffMinutes = Math.abs(c.createdAt.date.diff(p.createdAt.date, 'minutes'))
            return c.isReceived === p.isReceived && diffMinutes < 15
        })
    }

    onSubmit(event){

        event.preventDefault()

        const text = this.messageInputRef.current.value

        this.props.submitMessage(this.state.chatId, text).then(() => {
            this.messageInputRef.current.value = ""
        }).catch(() => {
            console.log("onSubmitFail")
        })
    }

    onChatChange(){
        this.setState({
            chatLoading: true
        }, this.fetchChat)

    }
    
    componentDidUpdate(prevProps){


        const prevChatId = prevProps.match.params.chat
        const chatId = this.props.match.params.chat

        if(prevProps.chats !== this.props.chats){
            this.initListScroll()
        }
        
        if(prevChatId !== chatId){
            this.onChatChange()
        }

    }

    fetchChat(){
        const { chat: chat_id } = this.props.match.params
        this.props.getChatAction(chat_id).then(chat => {

            this.setState({
                chatLoading: false,
                chatId: chat.id
            })

            this.initListScroll()

            window.messages = this.props.chats.find(_chat => _chat.id === chat.id).messages
        })
        .catch(error => {
            console.error({
                FetchingChatError: error
            })
            this.props.history.push('/messages')
        })
    }

    async componentDidMount(){

        this.fetchChat()
    }

    retrieveUserFromStore(user = null){

        if(!user) return user;

        if(typeof this.props.users[user.id] !== "undefined"){
            return this.props.users[user.id]
        } else {
            return user
        }
    }

    render(){

        const chat = this.props.chats.find(chat => chat.id === this.state.chatId)

        if(this.state.chatLoading || !chat){
            return <div/>
        }

        const interlocutor = this.retrieveUserFromStore(chat.participants[0])
        const organizedMessages = this.getMessagesAsGroups(chat.messages)

        return (
            <div className="PageMessage-chat">
                <div className="PageMessage-chat-lesmessages">
                    <div className="PageMessage-chat-title">
                        <div className="avatar">
                            <img src={interlocutor.avatar} alt=""/>
                        </div>
                        <h3>{interlocutor.username}</h3>
                        <div className={Utils.setClassName("user-status", {
                            "is-online": interlocutor.is_connected
                        })}>
                            <span></span>
                        </div>
                    </div>
                    {organizedMessages.length === 0 && (
                        <div className="nomessages">
                            <div className="nomessages-participants">
                                <div className="avatar">
                                    {this.props.user && <img src={this.props.user.avatar} alt=""/>}
                                </div>
    
                                <div className="avatar">
                                    <img src={interlocutor.avatar} alt=""/>
                                </div>
                            </div>
                            <p>Say hello to your new contact {interlocutor.username}</p>
                        </div>
                    )}
                    {organizedMessages.length > 0 && (
                        <div ref={this.messagesListRef} className="PageMessage-chat-list">
                        {
    
                                organizedMessages.map((group, groupIndex) => {
        
                                    if(group instanceof Array){
                                        return (
                                            <MessageGroup key={"message-item-" + groupIndex} group={group}/>
                                        )
                                    } else {
        
                                        const {author, createdAt, isReceived, text} = group
                                        
                                        return (
                                            <MessageItem 
                                                key={"message-item-" + groupIndex}
                                                author={author}
                                                isReceived={isReceived}
                                                createdAt={createdAt}
                                                text={text}
                                            />
                                        )
                                    }
                                })
                            }
                        </div>
                        )}
                </div>
                        
                <form onSubmit={this.onSubmit} className="PageMessage-chat-write">
                    <input ref={this.messageInputRef} className="typetext" type="text" placeholder="Type your message"/>
                    <button className="send" type="submit">SEND</button>
                </form>
            </div>
        )
    }
}


const mapStateToProps = state => {
    return {
        user: state.user,
        users: state.users,
        chats: state.chats,
    }
}

const mapDispatchToProps = dispatch => ({
    getChatAction: (...args) => dispatch(getChatAction(...args)),
})

export default connect(mapStateToProps, mapDispatchToProps)(
    withRouter(
        PageChat
    )
)