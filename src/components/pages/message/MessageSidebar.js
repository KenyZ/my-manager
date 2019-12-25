
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
    addContact
} from '../../../store/actions/actions'

const DiscussionOrContactItem = ({contact, isOnline, lastMessage}) => {

    const isContact = typeof lastMessage !== "undefined" ? false : true
    const ComponentLink = isContact ? Link : NavLink

    return (
        <ComponentLink 
            to={"/messages/t/" + contact.username} 
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

        this.TAB_DISCUSSIONS = "TAB_DISCUSSIONS"
        this.TAB_CONTACTS = "TAB_CONTACTS"

        this.fetchChats = this.fetchChats.bind(this)
        this.toggleSidebarTab = this.toggleSidebarTab.bind(this)
        this.groupContactsByLetter = this.groupContactsByLetter.bind(this)
        this.handleSearchContact = this.handleSearchContact.bind(this)
        this.addNewContact = this.addNewContact.bind(this)
        this.closeSearchbar = this.closeSearchbar.bind(this)

        this.state = {
            tab: this.TAB_DISCUSSIONS,
            searchNewContact: true,
            foundUsers: null
        }
    }

    fetchChats(){
        return RequestData.getDiscussionsAndContacts().then(chats => {
            this.props.setContacts(chats.contacts)
            this.props.setChats(chats.chats)
            
        })
    }

    componentDidMount(){
        this.fetchChats()
    }

    toggleSidebarTab(type = this.TAB_DISCUSSIONS){
        return () => {

            if(this.state.tab !== type) {
                this.closeSearchbar()
                this.setState({
                    tab: type
                })
            }
        }
    }

    closeSearchbar(){
        this.setState({
            searchNewContact: false,
            foundUsers: null
        })
    }

    groupContactsByLetter(contacts){

        let group = {}
        
        if(!contacts || contacts.length === 0){
            return null
        }
        
        for(let i = 0; i < contacts.length; i++){
            let contactsItem = contacts[i]
            let firstLetter = contactsItem.username[0].toUpperCase()
            if(group[firstLetter]){
                group[firstLetter].push(contactsItem)
            } else {
                group[firstLetter] = [contactsItem]
            }
        }

        return group
    }

    async handleSearchContact(event){
        const value = event.target.value
        const foundUsers = await RequestData.findUsers(value)
        this.setState({foundUsers: foundUsers})
    }

    addNewContact(userId){
        return async () => {

            const addedContact = await RequestData.addNewContact(userId)

            if(addedContact){
                this.props.addContact(addedContact)
            }

            this.closeSearchbar()
        }
    }

    render(){

        const chats = this.props.chats
        const groupedContacts = this.groupContactsByLetter(this.props.contacts)

        return (
            <div className="PageMessage-sidebar">
                <div className="PageMessage-sidebar-nav">
                    <div className={Utils.setClassName("PageMessage-sidebar-nav-btn", {active: this.state.tab === this.TAB_DISCUSSIONS})}>
                        <button 
                            onClick={this.toggleSidebarTab(this.TAB_DISCUSSIONS)} 
                            className="PageMessage-sidebar-nav-btn__btn">
                            <svg viewBox="0 0 24 24"><path d="M17 12V3a1 1 0 00-1-1H3a1 1 0 00-1 1v14l4-4h10a1 1 0 001-1m4-6h-2v9H6v2a1 1 0 001 1h11l4 4V7a1 1 0 00-1-1z" /></svg>
                            <span>Chats</span>
                        </button>
                    </div>

                    <div className={Utils.setClassName("PageMessage-sidebar-nav-btn", {active: this.state.tab === this.TAB_CONTACTS})}>
                        <button 
                            onClick={this.toggleSidebarTab(this.TAB_CONTACTS)} 
                            className="PageMessage-sidebar-nav-btn__btn">
                            <svg viewBox="0 0 24 24"><path d="M6 17c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6m9-9a3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 013-3 3 3 0 013 3M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z" /></svg>
                            <span>Contacts</span>
                        </button>
                    </div>
                </div>
                {this.state.tab === this.TAB_DISCUSSIONS && <div className="PageMessage-sidebar-section PageMessage-sidebar-section__discussions">
                    <h3 className="PageMessage-sidebar-section-title">RECENT CONVERSATIONS</h3>
                    <div className="PageMessage-sidebar-section-content">
                        <div className="PageMessage-sidebar-section-content-list">
                            { chats && 
                                chats.map((discussionsItem, discussionsItemIndex) => {
    
                                    const {id, chat, messages, participants} = discussionsItem
                                    const lastMessage = messages[0]
    
                                    const isOnline = Math.random() > .4
    
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
                </div>}
    
                {this.state.tab === this.TAB_CONTACTS && (
                    <div className="PageMessage-sidebar-section PageMessage-sidebar-section__contacts">
                            <div className="PageMessage-sidebar-section-addContact">
                                {this.state.searchNewContact ? 
                                (
                                    <React.Fragment>
                                        <input onChange={this.handleSearchContact}className="PageMessage-sidebar-section-addContact-input" type="text" placeholder="Enter a username"/>
                                        <button onClick={this.closeSearchbar} className="mm__btn-close">
                                            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>
                                        </button>
                                    </React.Fragment>
                                ) : 
                                
                                (
                                    <button 
                                        onClick={() => this.setState({searchNewContact: true})}className="PageMessage-sidebar-section-addContact-btn">
                                        <span>NEW CONTACT</span>
                                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                                    </button>
                                )}
                                {this.state.searchNewContact && <div className="PageMessage-sidebar-section-addContact-list">
                                    {
                                        (this.state.foundUsers && this.state.foundUsers.length > 0) && (

                                            this.state.foundUsers.map((foundUsersItem, newContactItemIndex) => {

                                                return (
                                                    <button 
                                                        key={newContactItemIndex} className="PageMessage-sidebar-section-addContact-list-item"
                                                        onClick={this.addNewContact(foundUsersItem.id)}
                                                    >
                                                        <div className="PageMessage-sidebar-section-addContact-list-item-avatar">
                                                            <img src={foundUsersItem.avatar} alt=""/>
                                                        </div>
                                                        <span className="PageMessage-sidebar-section-addContact-list-item-username">{foundUsersItem.username}</span>
                                                        <span className="PageMessage-sidebar-section-addContact-list-item-icon">
                                                            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                                                        </span>
                                                    </button>
                                                )
                                            })
                                        )
                                    }
                                </div>}
                            </div>
                            <h3 className="PageMessage-sidebar-section-title">CONTACTS</h3>
                            <div className="PageMessage-sidebar-section-content">
                                <div className="PageMessage-sidebar-section-content-list">
                                    {groupedContacts && (null || Object.entries(groupedContacts)).map(([keyLetter, contacts], groupedContactsIndex) => {
                
                                        return (
                                            <React.Fragment key={groupedContactsIndex}>
                                                <p className="PageMessage-sidebar-section-content-list-letter">{keyLetter}</p>
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
                                            </React.Fragment>
                                        )
                                    })}
                
                                </div>
                            </div>
                        </div>
                )}
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
        addContact: contact => dispatch(addContact(contact))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageSidebar)