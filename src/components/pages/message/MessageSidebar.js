
import React, {
    useState,
    useEffect,
    useContext
} from 'react'
import {
    NavLink
} from 'react-router-dom'
import moment from 'moment'

window.moment = moment

import StoreContext from '../../../utils/Store/StoreContext'
import {setChats} from '../../../utils/Store/actions'
import Utils from '../../../utils/Utils'

const data = [
    {id:0, avatar: 'https://picsum.photos/id/10/300/300', name: 'Alice Kennedy', content: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laborum maxime consectetur ab. Itaque, eos deleniti.', created_at: new Date('Tue Nov 26 2019')},
    {id: 1, avatar: 'https://picsum.photos/id/20/300/300', name: 'Toony montana', content: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laborum maxime consectetur ab. Itaque, eos deleniti.', created_at: new Date('Tue Nov 26 2019')},
    {id: 2, avatar: 'https://picsum.photos/id/30/300/300', name: 'Kevin doms', content: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laborum maxime consectetur ab. Itaque, eos deleniti.', created_at: new Date('Tue Nov 26 2019')},
]

const MessageSidebar = () => {

    const {state: appStore, dispatch: appStoreDispatcher} = useContext(StoreContext)
    const [loading, isLoading] = useState(true)
    const [discussions, setDiscussions] = useState([])

    const requestChats = () => {

        Utils.requestApi('discussions', {
            body: {
                token: appStore.token
            }
        }).then(response => {

            if(response.body.error){
                return
            }

            const chats = response.body.data.chats
            setDiscussions(chats)
            // appStoreDispatcher(setChats(response.body.data.chats))
        })
    }

    useEffect(requestChats, [])
    useEffect(() => {
        isLoading(discussions.length === 0)
    }, [discussions])

    return (
        <div className="PageMessage-sidebar">
            <div className="PageMessage-sidebar-section">
                <h3 className="PageMessage-sidebar-section-title">DIRECT</h3>
                <div className="PageMessage-sidebar-section-content">
                    <div className="PageMessage-sidebar-section-content-list">
                        { !loading && 
                            discussions.map((discussionsItem, discussionsItemIndex) => {

                                const {id, lastMessage, participants} = discussionsItem
                                const {text, createdAt, author: {avatar, username}} = lastMessage
                                const createdAtText = Utils.getDiffDate(createdAt)

                                const isOnline = Math.random() > .4

                                return (
                                    <NavLink to={"/messages/c/" + id} key={"section-list-item-" + id} 
                                    className={"PageMessage-sidebar-section-content-list-item" + (isOnline ? " online" : "")}>
                                        {lastMessage && (
                                            <React.Fragment>
                                                <div 
                                                    className={"PageMessage-sidebar-section-content-list-item-avatar"}
                                                >
                                                    <img src={participants[0].avatar} alt=""/>
                                                </div>
                                                <div className="PageMessage-sidebar-section-content-list-item-body">
                                                    <h4 className={"PageMessage-sidebar-section-content-list-item-body-name" + (isOnline ? " online" : "")}>{participants[0].username}</h4>
                                                    <p className="PageMessage-sidebar-section-content-list-item-body-text">{text}</p>
                                                    <p className="PageMessage-sidebar-section-content-list-item-body-date">{createdAtText}</p>
                                                </div>
                                            </React.Fragment>
                                        )}
                                    </NavLink>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MessageSidebar