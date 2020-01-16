
import React from 'react'
import {
    NavLink,
    Link
} from 'react-router-dom'

import Utils from '../../../utils/Utils'
import RequestData from '../../../utils/RequestData'
import { connect } from 'react-redux'
import {
    getDiscussionsAndChatsAction,
    addContact
} from '../../../store/actions/actions'


// Material UI

import {
    Tabs,
    Tab,
    TabPanel,
    withStyles
} from '@material-ui/core'

import {
    ContactPhone,
    ChatBubble,
    People
} from '@material-ui/icons'


const styles = {

    tab_label: {
        color: "#fff",
        fontWeight: 600
    },

    tab_indicator: {
        background: "#fff"
    },

    tab_root: {
        marginBottom: 25
    }
}

const DiscussionOrContactItem = ({chatId = null, contacts = null, contact = contacts[0], isOnline, lastMessage}) => {

    const isContact = typeof lastMessage !== "undefined" ? false : true
    const ComponentLink = isContact ? Link : NavLink

    const isGroup = contacts && contacts.length > 1

    return (
        <ComponentLink 
            to={"/messages/t/" + (isGroup ? chatId : contact.username)} 
            key={"section-list-item-" + contact.id} 
            className={Utils.setClassName("PageMessage-sidebar-section-content-list-item", {
                "is-contact": isContact,
            })}
        >
            <div 
                className={Utils.setClassName("PageMessage-sidebar-section-content-list-item-avatar", {
                    "is-group": isGroup
                })}
            >
                <div 
                    style={{
                        backgroundImage: `url(${contact.avatar})`
                    }}
                    className={Utils.setClassName("", {
                        "is-online": contact.is_connected,
                    })}
                />

                {isGroup && contacts[1] && (
                <div 
                    style={{
                        backgroundImage: `url(${contacts[1].avatar})`
                    }}
                    className={Utils.setClassName("", {
                        "is-online": contacts[1].is_connected,
                    })}
                />)}
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

const DiscussionItem = ({lastMessage, isOnline, contacts, chatId = null}) => {

    return (
        <DiscussionOrContactItem
            contacts={contacts}
            isOnline={isOnline}
            lastMessage={lastMessage}
            chatId={chatId}
        />
    )
}


class MessageSidebar extends React.Component{

    constructor(props){
        super(props)

        this.TAB_DISCUSSIONS = "TAB_DISCUSSIONS"
        this.TAB_CONTACTS = "TAB_CONTACTS"

        this.toggleSidebarTab = this.toggleSidebarTab.bind(this)
        this.groupContactsByLetter = this.groupContactsByLetter.bind(this)
        this.handleSearchContact = this.handleSearchContact.bind(this)
        this.addNewContact = this.addNewContact.bind(this)
        this.closeSearchbar = this.closeSearchbar.bind(this)
        this.onTabChange = this.onTabChange.bind(this)
        this.retrieveUserFromStore = this.retrieveUserFromStore.bind(this)

        this.state = {
            tab: this.TAB_DISCUSSIONS,
            tabIndex: 0,
            searchNewContact: true,
            foundUsers: null
        }
    }

    componentDidMount(){
        this.props.getDiscussionsAndChatsAction()
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

    onTabChange(event, tab){
        this.setState({tab})
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

        const {classes} = this.props

        const chats = this.props.chats
        const contacts = Object.values(this.props.users).filter(users => users.is_contact && users.is_contact === true)
        const groupedContacts = this.groupContactsByLetter(contacts)

        return (
            <div className="PageMessage-sidebar">

                <Tabs
                    value={this.state.tab}
                    onChange={this.onTabChange}
                    indicatorColor="primary"
                    classes={{
                        indicator: classes.tab_indicator,
                        root: classes.tab_root
                    }}
                >
                    <Tab value={this.TAB_DISCUSSIONS} icon={<ChatBubble/>} label="Chats" id="tab_chats" classes={{root: classes.tab_label}}/>
                    <Tab value={this.TAB_CONTACTS} icon={<People/>} label="Contacts" id="tab_contacts" classes={{root: classes.tab_label}}/>
                </Tabs>

                {this.state.tab === this.TAB_DISCUSSIONS && <div className="PageMessage-sidebar-section PageMessage-sidebar-section__discussions">
                    <h3 className="PageMessage-sidebar-section-title">RECENT CONVERSATIONS</h3>
                    <div className="PageMessage-sidebar-section-content">
                        <div className="PageMessage-sidebar-section-content-list">
                            { chats && 
                                chats.map((discussionsItem, discussionsItemIndex) => {
    
                                    const {id, chat, messages, participants, last_message} = discussionsItem    
                                    const isOnline = Math.random() > .4

                                    const retrievedParticipants = participants.map(p => this.retrieveUserFromStore(p))
    
                                    return (
                                        <DiscussionItem 
                                            key={"discussion-item-" + discussionsItemIndex}
                                            lastMessage={last_message}
                                            isOnline={isOnline}
                                            contacts={retrievedParticipants}
                                            chatId={id}
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
        chats: state.chats,
        users: state.users,
    }
}

const mapDispatchToProps = dispatch => ({
    getDiscussionsAndChatsAction: (...args) => dispatch(getDiscussionsAndChatsAction(...args)),
    addContact: (...args) => dispatch(addContact(...args))
})

export default connect(mapStateToProps, mapDispatchToProps)(
    withStyles(styles)(MessageSidebar)
)