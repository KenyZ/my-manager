import React, {
    useEffect,
    useContext,
    useState,
    useCallback,
    useRef
} from 'react'
import PropTypes from 'prop-types'
import {
    useParams
} from 'react-router-dom'
import moment from 'moment'

import Utils from '../../../utils/Utils'
import StoreContext from '../../../utils/Store/StoreContext'
import RequestData from '../../../utils/RequestData'
import {useRequestedData} from '../../shared/hooks'

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

const PageChat = () => {


    // VERIFIER QUE LE CHAT BELONGS TO USER || this.USER is partcipant ?

    const {chat: chatID} = useParams()
    const {state: appStore, dispatch: appStoreDispatcher} = useContext(StoreContext)
    const messageInput = useRef(null)
    const [chat, setChat] = useState(null)

    const fetchChat = () => {
        return RequestData.getChat(chatID, appStore.token)
    }

    const receiveChat = chat => {
        setChat(chat)
    }

    const {isFetching: isFetchingChat} = useRequestedData(fetchChat, receiveChat, [chatID])

    // const onChangeChat = () => {

    //     setLoading(true)
    //     setChat(null)
    //     requestChat()
    // }

    const initListScroll = useCallback(node => {

        if(node !== null){
            const scroll = node.scrollHeight - node.offsetHeight
            node.scrollTop = scroll + 10
        }

    }, [chat])

    const getMessagesAsGroups = chat => {

        if(chat.messages.length === 0){
            return []
        }

        const organizedMessages = Utils.linkBy(chat.messages, (c, p) => {

            let diffMinutes = Math.abs(c.createdAt.date.diff(p.createdAt.date, 'minutes'))
            return c.isReceived === p.isReceived && diffMinutes < 15
        })

        return organizedMessages
    }

    const sendMessage = event => {

        event.preventDefault()

        const text = messageInput.current.value
        RequestData.createMessage(appStore.token, text, chat.contact.id).then(createdMessage => {

            messageInput.current.value = ""
            if(createdMessage){
                setChat({
                    ...chat,
                    messages: [
                        ...chat.messages,
                        createdMessage
                    ]
                })
            }
        })
    }
    
    // useEffect(onChangeChat, [chatID])


    if(isFetchingChat && !chat){
        return <div/>
    }

    // CHAT IS DEFINED

    const interlocutor = chat.contact
    const organizedMessages = getMessagesAsGroups(chat)

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
                                <img src={appStore.user.avatar} alt=""/>
                            </div>

                            <div className="avatar">
                                <img src={interlocutor.avatar} alt=""/>
                            </div>
                        </div>
                        <p>Say hello to your new contact {interlocutor.username}</p>
                    </div>
                )}
                {organizedMessages.length > 0 && <div ref={initListScroll} className="PageMessage-chat-list">
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
                </div>}
            </div>
                    
            <form onSubmit={sendMessage} className="PageMessage-chat-write">
                <input ref={messageInput} className="typetext" type="text" placeholder="Type your message"/>
                <button className="send" type="submit">SEND</button>
            </form>
        </div>
    )
}

export default PageChat