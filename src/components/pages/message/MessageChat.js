import React, {
    useEffect,
    useContext,
    useState
} from 'react'
import PropTypes from 'prop-types'
import {
    useParams
} from 'react-router-dom'
import moment from 'moment'

import Utils from '../../../utils/Utils'
import StoreContext from '../../../utils/Store/StoreContext'
import RequestData from '../../../utils/RequestData'

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
                <p>{text}</p>
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
    const [chat, setChat] = useState(null)
    const [isLoading, setLoading] = useState(true)

    const requestChat = () => {
        RequestData.getChat(chatID, appStore.token).then(chat => {
            setChat(chat)
        })
    }

    const onChangeChat = () => {
        setLoading(true)
        setChat(null)
        requestChat()
    }

    useEffect(requestChat, [])

    useEffect(() => {
        setLoading(chat === null)
    }, [chat])

    useEffect(onChangeChat, [chatID])

    if(isLoading){
        return <div/>
    }

    // CHAT IS DEFINED

    const interlocutor = chat.participants[0]

    return (
        <div className="PageMessage-chat">
            <div className="PageMessage-chat-title">
                <div className="avatar">
                    <img src={interlocutor.avatar} alt=""/>
                </div>
                <h3>{interlocutor.username}</h3>
            </div>
            <div className="PageMessage-chat-list">
                {

                    chat.messages.map((group, groupIndex) => {

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
        </div>
    )
}

export default PageChat