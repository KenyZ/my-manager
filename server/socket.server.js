
module.exports = function(
    io,
    models,
    Helpers
){

    const {
        User,
        Message,
        Chat
    } = models
    
    const self = {}

    const SOCKET_PRIVATE_ROOM_PREFIX = "SOCKET_PRIVATE_ROOM_PREFIX."

    self.initSocketMessageServer = () => {

        const attachEvents = (_socket, decodedToken) => {

            _socket.on("send_message", async (chat_id, text, sendMessageCallback) => {
                const {error, data: createdMessage} = await Message.createMessage(decodedToken.id, chat_id, text, undefined, true)

                if(createdMessage){
                    const {error, data: availableParticipants} = await Chat.getAvailableParticipants(chat_id, decodedToken.id)
                    
                    if(error){

                        return;
                    }

                    if(availableParticipants){

                        sendMessageCallback(Boolean(createdMessage))

                        console.log({availableParticipants})

                        availableParticipants.map(availableParticipantsItems => {
                            _socket.broadcast.to(SOCKET_PRIVATE_ROOM_PREFIX + availableParticipantsItems.id)
                                .emit("receive_message", createdMessage)
                        })

                        _socket.emit("receive_message", createdMessage)
                    }

                }
            })
        }

        const startMessageSocketServer = (_socket, decodedToken) => {
            _socket.join(SOCKET_PRIVATE_ROOM_PREFIX + decodedToken.id, async () => {
                let settingIsConnected = await User.setStatus(decodedToken.id, true)
                let fetchingContacts = await User.fetchContacts(decodedToken.id)

                fetchingContacts.map(fetchedContactsItem => {
                    _socket.broadcast.to(SOCKET_PRIVATE_ROOM_PREFIX + fetchedContactsItem.id)
                        .emit("has_entered", decodedToken.id)
                })

            })

            attachEvents(_socket, decodedToken)


            _socket.on("disconnect", async () => {
                console.log("Client has disconnect")
                let settingIsNotConnected = await User.setStatus(decodedToken.id, false)
                let fetchingContacts = await User.fetchContacts(decodedToken.id)

                fetchingContacts.map(fetchedContactsItem => {
                    _socket.broadcast.to(SOCKET_PRIVATE_ROOM_PREFIX + fetchedContactsItem.id)
                        .emit("has_leave", decodedToken.id)
                })
            })
        }

        io.of('/messages').on('connection', socket => {
    
            console.log("New client connected on 'messages' => " + socket.id)
            
            socket.on('is_connected', async ({access_token}) => {
                const decodedToken = await Helpers.verifyToken(access_token)
                    
                console.log('User is connected', socket.id)
                
                if(decodedToken && decodedToken.id){ // well identified
                    startMessageSocketServer(socket, decodedToken)
                } else {
                    console.log("CheckingUserToken has failed")
                }        
            })

        })
    }

    return self
}



