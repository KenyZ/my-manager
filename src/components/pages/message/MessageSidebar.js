
import React from 'react'
import {
    NavLink,
    Link
} from 'react-router-dom'

import Utils from '../../../utils/Utils'
import RequestData from '../../../utils/RequestData'
import { connect } from 'react-redux'
import {
    setContacts,
    setChats,
} from '../../../store/actions/actions'

const DiscussionOrContactItem = ({contact, isOnline, lastMessage = null}) => {

    const isContact = typeof lastMessage !== "undefined" ? false : true
    const ComponentLink = isContact ? Link : NavLink

    return (
        <ComponentLink 
            to={"/messages/talk/" + contact.id} 
            key={"section-list-item-" + contact.id} 
            className={Utils.setClassName("PageMessage-sidebar-section-content-list-item", {
                "is-online": isOnline,
                "is-contact": isContact,
            })}
        >
            <div 
                className={"PageMessage-sidebar-section-content-list-item-avatar"}
            >
                <div style={{
                    backgroundImage: `url(${contact.avatar})`
                }}/>
            </div>
            <div className="PageMessage-sidebar-section-content-list-item-body">
                <div className="PageMessage-sidebar-section-content-list-item-body-info">
                    <span className={Utils.setClassName("PageMessage-sidebar-section-content-list-item-body-name")}>{contact.username}</span>
                    {lastMessage && <span className="PageMessage-sidebar-section-content-list-item-body-date">{lastMessage.createdAt.text}</span>}
                </div>
                {lastMessage && <p className="PageMessage-sidebar-section-content-list-item-body-text">{lastMessage.text}</p>}
            </div>
        </ComponentLink>
    )
}

const ContactItem = ({isOnline, contact}) => {

    return (
        <DiscussionOrContactItem
            contact={contact}
            isOnline={isOnline}
        />
    )
}

const DiscussionItem = ({lastMessage, isOnline, contact}) => {

    return (
        <DiscussionOrContactItem
            contact={contact}
            isOnline={isOnline}
            lastMessage={lastMessage}
        />
    )
}

class MessageSidebar extends React.Component{

    constructor(props){
        super(props)
        this.fetchChats = this.fetchChats.bind(this)
    }

    fetchChats(){
        return RequestData.getDiscussionsAndContacts(this.props.accessToken).then(chats => {
            this.props.setContacts(chats.contacts)
            this.props.setChats(chats.chats)
            
        })
    }

    componentDidMount(){
        this.fetchChats()
    }

    render(){


        const contacts = this.props.contacts
        const chats = this.props.chats

        return (
            <div className="PageMessage-sidebar">
                <div className="PageMessage-sidebar-opener">
                    <button className="PageMessage-sidebar-opener__btn"></button>
                </div>
                <div className="PageMessage-sidebar-section">
                    <h3 className="PageMessage-sidebar-section-title">DIRECT</h3>
                    <div className="PageMessage-sidebar-section-content">
                        <div className="PageMessage-sidebar-section-content-list">
                            { chats && 
                                chats.map((discussionsItem, discussionsItemIndex) => {
    
                                    const {id, chat, messages, participants} = discussionsItem
                                    const lastMessage = messages[0]
    
                                    const isOnline = Math.random() > .4

                                    console.log({p: participants, participants: participants[0]})
    
                                    return (
                                        <DiscussionItem 
                                            key={"discussion-item-" + discussionsItemIndex}
                                            lastMessage={lastMessage}
                                            isOnline={isOnline}
                                            contact={participants[0]}
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
                            { contacts && 
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
        accessToken: state.accessToken,
        contacts: state.contacts,
        chats: state.chats,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setContacts: contacts => dispatch(setContacts(contacts)),
        setChats: chats => dispatch(setChats(chats)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageSidebar)