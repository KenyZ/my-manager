
import React from 'react'
import {
    NavLink,
    Link
} from 'react-router-dom'
import moment from 'moment'

import Utils from '../../../utils/Utils'
import RequestData from '../../../utils/RequestData'
import StorageManager from '../../../utils/StorageManager'
import { connect } from 'react-redux'

const DiscussionOrContactItem = ({id, isOnline, lastMessage, createdAt, participant, isContact = false}) => {

    const ThisLink = isContact ? Link : NavLink

    return (
        <ThisLink 
            to={"/messages/talk/" + id} 
            key={"section-list-item-" + id} 
            className={Utils.setClassName("PageMessage-sidebar-section-content-list-item", {
                "is-online": isOnline,
                "is-contact": isContact,
            })}
        >
            <div 
                className={"PageMessage-sidebar-section-content-list-item-avatar"}
            >
                <div style={{
                    backgroundImage: `url(${participant.avatar})`
                }}/>
            </div>
            <div className="PageMessage-sidebar-section-content-list-item-body">
                <div className="PageMessage-sidebar-section-content-list-item-body-info">
                    <span className={Utils.setClassName("PageMessage-sidebar-section-content-list-item-body-name")}>{participant.username}</span>

                    {createdAt && <span className="PageMessage-sidebar-section-content-list-item-body-date">{createdAt}</span>}
                </div>
                {lastMessage && (
                    <p className="PageMessage-sidebar-section-content-list-item-body-text">{lastMessage.text}</p>
                )}
            </div>
        </ThisLink>
    ) 
}

const ContactItem = ({isOnline, contact, id}) => {
    return (
        <DiscussionOrContactItem
            id={id}
            isOnline={isOnline}
            participant={contact}
            isContact={true}
        />
    )
}

const DiscussionItem = ({id, isOnline, lastMessage, createdAt, participant}) => {

    const {text, author = {avatar, username}} = lastMessage

    return (
        <DiscussionOrContactItem
            id={id}
            isOnline={isOnline}
            participant={participant}
            createdAt={createdAt}
            lastMessage={lastMessage}
        />
    )
}

class MessageSidebar extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            chats: {
                loading: true,
                data: null
            }
        }

        this.fetchChats = this.fetchChats.bind(this)
    }

    fetchChats(){
        return RequestData.getDiscussionsAndContacts(this.props.accessToken).then(chats => {
            this.setState({
                chats: {
                    loading: false,
                    data: chats
                }
            })
        })
    }

    componentDidMount(){
        this.fetchChats()
    }

    render(){

        const {loading: chatsLoading, data} = this.state.chats
        const {chats = null, contacts = null} = data || {}

        return (
            <div className="PageMessage-sidebar">
                <div className="PageMessage-sidebar-opener">
                    <button className="PageMessage-sidebar-opener__btn"></button>
                </div>
                <div className="PageMessage-sidebar-section">
                    <h3 className="PageMessage-sidebar-section-title">DIRECT</h3>
                    <div className="PageMessage-sidebar-section-content">
                        <div className="PageMessage-sidebar-section-content-list">
                            { !chatsLoading && 
                                chats.map((discussionsItem, discussionsItemIndex) => {
    
                                    const {id, lastMessage, participants} = discussionsItem
                                    const {createdAt: {text: createdAtText}} = lastMessage
    
                                    const isOnline = Math.random() > .4
    
                                    return (
                                        <DiscussionItem 
                                            key={"discussion-item-" + discussionsItemIndex}
                                            id={participants[0].id}
                                            lastMessage={lastMessage}
                                            createdAt={createdAtText}
                                            isOnline={isOnline}
                                            participant={participants[0]}
                                        />
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
    
                <div className="PageMessage-sidebar-section">
                    <h3 className="PageMessage-sidebar-section-title">CONTACTS</h3>
                    <div className="PageMessage-sidebar-section-content">
                        <div className="PageMessage-sidebar-section-content-list">
                            { !chatsLoading && 
                                contacts.map((contactsItem, contactsItemIndex) => {
    
                                    const isOnline = Math.random() > .4
    
                                    return (
                                        <ContactItem 
                                            key={"contact-item-" + contactsItemIndex}
                                            isOnline={isOnline}
                                            contact={contactsItem}
                                            id={contactsItem.id}
                                        />
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        accessToken: state.accessToken
    }
}

const mapDispatchToProps = dispatch => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageSidebar)