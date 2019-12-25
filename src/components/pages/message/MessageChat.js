import React from 'react'
import PropTypes from 'prop-types'
import {
    withRouter
} from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'

import Utils from '../../../utils/Utils'
import RequestData from '../../../utils/RequestData'
import StorageManager from '../../../utils/StorageManager'
 
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
            chat: {
                loading: true,
                data: null
            }
        }

        this.messagesListRef = React.createRef(null)
        this.messageInputRef = React.createRef(null)

        this.fetchChat = this.fetchChat.bind(this)
        this.initListScroll = this.initListScroll.bind(this)
        this.getMessagesAsGroups = this.getMessagesAsGroups.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
        this.onChatChange = this.onChatChange.bind(this)
    }

    fetchChat(){
        const { chat } = this.props.match.params
        return RequestData.getChat(chat).then(chat => {
            this.setState({
                chat: {
                    loading: this.state.chat.loading,
                    data: chat
                }
            })

            this.initListScroll()
        })
    }

    initListScroll(){

        if(this.messagesListRef.current){
            const scroll = this.messagesListRef.current.scrollHeight - this.messagesListRef.current.offsetHeight
            this.messagesListRef.current.scrollTop = scroll + 10
        }

    }

    getMessagesAsGroups(chat){

        if(chat.messages.length === 0){
            return []
        }

        const organizedMessages = Utils.linkBy(chat.messages, (c, p) => {

            let diffMinutes = Math.abs(c.createdAt.date.diff(p.createdAt.date, 'minutes'))
            return c.isReceived === p.isReceived && diffMinutes < 15
        })

        return organizedMessages
    }

    sendMessage(event){

        event.preventDefault()

        const text = this.messageInputRef.current.value
        const chat = this.state.chat.data

        RequestData.createMessage(text, chat.id).then(createdMessage => {

            this.messageInputRef.current.value = ""

            if(createdMessage){

                this.setState({
                    chat: {
                        loading: this.state.chat.loading,
                        data: {
                            ...chat,
                            messages: [
                                ...chat.messages,
                                createdMessage
                            ]
                        }
                    }
                }, this.initListScroll)
            }
        })
    }

    onChatChange(){
        this.setState({
            chat: {
                loading: true,
                data: null
            }
        }, this.fetchChat)

    }
    
    componentDidUpdate(prevProps){

        const prevChat = prevProps.match.params.chat
        const chat = this.props.match.params.chat
        
        if(prevChat !== chat){
            this.onChatChange()
        }

    }

    componentDidMount(){
        this.fetchChat()
    }

    render(){

        const {loading: chatLoading, data: chat} = this.state.chat

        if(chatLoading && !chat){
            return <div/>
        }

        const interlocutor = chat.contact
        const organizedMessages = this.getMessagesAsGroups(chat)

        return (
            <div className="PageMessage-chat">
                <div className="PageMessage-chat-lesmessages">
                    <div className="PageMessage-chat-title">
                        <div className="avatar">
                            <img src={interlocutor.avatar} alt=""/>
                        </div>
                        <h3>{interlocutor.username}</h3>
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
                        
                <form onSubmit={this.sendMessage} className="PageMessage-chat-write">
                    <input ref={this.messageInputRef} className="typetext" type="text" placeholder="Type your message"/>
                    <button className="send" type="submit">SEND</button>
                </form>
            </div>
        )
    }
}


const mapStateToProps = state => {
    return {
        user: state.user
    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withRouter(
        PageChat
    )
)