

const faker = require('faker')
const moment = require('moment')


const {
    sequelize,
    User,
    Chat,
    Message,

    UserChat,
    UserContact
} = require('./database')


const USERS_COUNT = 35
const CONTACT_BY_USER = 4
const MESSAGE_BY_CHAT = 25
const USERS_IN_GROUP = 5
const GROUP_COUNT = Math.round(USERS_COUNT / 10)


const Utils = {
    // add reference specification (id or index)
    generateUniquePairs: (array, n, reference = "index") => {

        const MAX_LOOP_ITERATION = array.length
        const MAX_PAIRS_COUNT = array.length
    
    
    
        return new Promise((resolve, reject) => {
    
            try{
    
                // if(n >= MAX_PAIRS_COUNT){
                //     console.error("too much pairs requested")
                //     return resolve([])
                // }
    
    
                if(array.some(_ => typeof _.id === "undefined")){
                    console.error('objects must have unique ID')
                    resolve([])
                }
            
                // refere by id or index
                array = array.map((a, aIndex) => reference === "id" ? a.id : reference === "index" ? aIndex : aIndex)
            
                let pairs = []
                let tryCountArray = []
            
                const hasSameValue = (self, paired) => self === paired
                const alreadyExistsInSelf = (self, paired) => {
            
                    let samePair = pairs.find(pairsItem => {
                        return (pairsItem[0] === self && pairsItem[1] === paired)
                    })
            
                    return typeof samePair !== "undefined"
                }
                const alreadyExists = (self, paired) => {
            
                    let samePair = pairs.find(pairsItem => {
                        return pairsItem[1] === self && pairsItem[0] === paired
                    })
            
                    return typeof samePair !== "undefined"
                }
    
            
                for(let i = 0; i < array.length; i++){
            
                    let self = array[i]
    
                    let pairCount = n instanceof Function ? n() : n
            
                    generatePairs: for(let j = 0; j < pairCount; j++){
                        // console.log({i ,j})
            
                        let pairedItem = faker.random.arrayElement(array)
                        let tryCount = 0
    
                        generateAPairedItem: while(
                            hasSameValue(self, pairedItem) ||
                            alreadyExistsInSelf(self, pairedItem)
                        ){
                            tryCount++
    
                            if(tryCount >= MAX_LOOP_ITERATION){
                                continue generatePairs;
                            }
    
                            pairedItem = faker.random.arrayElement(array)
                        }
    
                        if(alreadyExists(self, pairedItem)){
                            // console.log({
                            //     continue: true,
                            //     i,j
                            // })
                            continue;
                        }
    
                        tryCountArray.push(tryCount)
            
                        let createdPair = [self, pairedItem]
            
                        pairs.push(createdPair)
                    }
            
                }
                
                let performance = tryCountArray.reduce((a, c) => a + c) / array.length
                console.log({performance})
                console.log({tryCountArray: JSON.stringify(tryCountArray)})
    
                resolve(pairs)
            } catch(e) {
                console.error(e)
                reject([])
            }
        })
    },

    loop: (n, callback) => {
        return Array(n).fill(true).map(_ => callback(_))
    },

    randomArrayElemnts: (array, n) => {
        let _array = [...array]

        if(n >= array.length) return array

        return Utils.loop(n, () => {
            let randomIndex = faker.random.number(_array.length - 1)
            let randomItem = _array[randomIndex]
            _array.splice(randomIndex, 1)
            return randomItem
        })
    }
}




const seeding = () => {

    const creatingUsers = () => {

        const _creatingUsers = Utils.loop(USERS_COUNT, () => {

            const firstName = faker.name.firstName()
            const lastName = faker.name.lastName()
        
            return User.createUser(
                faker.internet.email(firstName, lastName),
                '1234',
                faker.internet.userName(firstName, lastName),
                faker.internet.avatar(),
                Math.random() > .5
            
            )
        })

        return Promise.all(_creatingUsers).then(createdUsers => {
            console.log("+ HAS CREATED USERS => " + createdUsers.length)
            return createdUsers
        })   
    }

    const creatingContact = users => {
        
        const randomContactByUser = () => faker.random.number(CONTACT_BY_USER) + 1

        return Utils.generateUniquePairs(users, randomContactByUser).then(generatedPairs => {

            const willGenerateContact = []
            for(let i = 0; i < generatedPairs.length; i++){

                const index1 = generatedPairs[i][0], index2 = generatedPairs[i][1]
                const user1 = users[index1], user2 = users[index2]
                
                willGenerateContact.push(
                    user1.addContact(user2),
                    user2.addContact(user1)
                )
            }

            return Promise.all(willGenerateContact).then(createdContacts => {
                console.log('+ HAS CREATED CONTACTS ' + createdContacts.length)
                return createdContacts
            }).then(() => ({
                users,
                pairs: generatedPairs
            }))
        })
    }

    const creatingSingleChat = ({users, pairs}) => {
        return Promise.all(
            pairs.map(([index0, index1]) => {
                const user1 = users[index0], user2 = users[index1]
    
                return Chat.create({

                })
                .then(createdChat => {


                    const randomMessageByChat = faker.random.number(MESSAGE_BY_CHAT) + 1

                    return Promise.all([
                        createdChat.setParticipants([user1, user2]).then(p => {          
                            console.log(`   + HAS ADDED USER${user1.id} AND USER${user2.id} TO CHAT${createdChat.id}`)
                        }),

                        Promise.all(
                            Utils.loop(randomMessageByChat, () => {
    
                                const author = Math.random() > .5 ? user1 : user2
    
                                let randDays = faker.random.number(10) + 1
                                let randHours = faker.random.number(23) + 1
    
                                let createdAt = moment().add(-randHours, 'hours').add(-randDays, 'days').format("YYYY-MM-DD HH:mm:ss")
    
    
                                return Message.createMessage(
                                    author.get('id'),
                                    createdChat.get('id'),
                                    faker.lorem.sentences(3),
                                    createdAt
                                )
                            })
                        ).then(createdMessages => {
                            console.log(`   + HAS CREATED ${createdMessages.length} MESSAGES FOR CHAT ${createdChat.get('id')}`)
                        })

                        
                    ])
                })

            })
        ).then(createdChats => {
            console.log('+ HAS CREATED CHATS ' + createdChats.length)
            return users
        })
    }

    const creatingGroupChat = users => {
        
        return Promise.all(
            Utils.loop(GROUP_COUNT, () => {

                const participants = Utils.randomArrayElemnts(users, USERS_IN_GROUP)

                return Chat.create().then(createdChat => {

                    const randomMessageByChat = faker.random.number(MESSAGE_BY_CHAT) + 1


                    return Promise.all([
                        createdChat.setParticipants(participants),

                        Promise.all(
                            Utils.loop(randomMessageByChat, () => {
    
                                const author = faker.random.arrayElement(participants)
    
                                let randDays = faker.random.number(10) + 1
                                let randHours = faker.random.number(23) + 1
    
                                let createdAt = moment().add(-randHours, 'hours').add(-randDays, 'days').format("YYYY-MM-DD HH:mm:ss")
    
    
                                return Message.createMessage(
                                    author.get('id'),
                                    createdChat.get('id'),
                                    faker.lorem.sentences(3),
                                    createdAt
                                )
                            })
                        ).then(({data: createdMessages}) => {
                            console.log(`   + HAS CREATED ${createdMessages.length} MESSAGES FOR CHAT ${createdChat.get('id')}`)
                        })
                    ])
                })
            })
        )
    }



    return creatingUsers().then(creatingContact).then(creatingSingleChat).then(creatingGroupChat)
    
}

sequelize.sync({force: true}).then(() => {
    return seeding().then(() => {
        console.log('#### DATABASE HAS BEEN FED ####')
        process.exit(0)
    })
})
