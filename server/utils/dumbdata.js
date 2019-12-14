const faker = require('faker')
const moment = require('moment')

const {sequelize, models} = require('../sequelize')

const USER_COUNT = 30
const CONTACT_BY_USER_COUNT = 4
const PERCENT_CHAT_BY_CONTACT = .4
const MESSAGES_BY_CHAT_COUNT = 10


if(sequelize && models){

    let action = feedDatabase


    action().finally(() => {

        const {User, Chat, Message} = models

        console.log('### ALL ENDED ###')
        // process.exit(0)
    })
}


function syncDatabaseSchema(){
    return sequelize.sync({force: true}).then(() => {
        console.log('DATABASE SCHEMA HAS BEEN SYNCED')
    })
}

const generateUniquePairs = (array, n) => {

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
        
            array = array.map(a => a.id)
        
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
}


function feedDatabase(){

    const {User, Chat, Message} = models

    const feed = () => {

        console.log('WILL FEED')

        return User.bulkCreate(
            Array(USER_COUNT).fill(true).map(_ => {
                return {
                    username: faker.internet.userName(), 
                    password: '1234', 
                    avatar: faker.internet.avatar()
                }
            })
        ).then(createdUsers => {

            console.log('Users created ' + createdUsers.length)


            const generatingPairs = generateUniquePairs(createdUsers, CONTACT_BY_USER_COUNT).then(generatedPairs => {

                const pairs = generatedPairs.map(([index0, index1]) => {

                    let pair0 = createdUsers.find(createdUsersItem => createdUsersItem.get('id') === index0)
                    let pair1 = createdUsers.find(createdUsersItem => createdUsersItem.get('id') === index1)
                    
                    return [pair0, pair1]
                })

                return pairs
            })

            return generatingPairs.then(pairs => {
                

                return Promise.all([
                    pairs.map(pairsItem => {
    
                        const percentChatByUser = Math.random() < PERCENT_CHAT_BY_CONTACT

                        return Promise.all(
                            [

                                pairsItem[0].addContact(pairsItem[1]),
                                pairsItem[1].addContact(pairsItem[0]),


                                (percentChatByUser && (Chat.create({}).then(createdChat => {
        
                                    return createdChat.setParticipants(pairsItem).then(() => {
                        
                                        return Promise.all(Array(MESSAGES_BY_CHAT_COUNT).fill(true).map((_, i) => {
            
                                            let index1 = Math.random() > .5 ? 1 : 0
                                            let author = pairsItem[index1]
                                            let target = pairsItem[index1 === 0 ? 1 : 0]
            
                                            let randDays = faker.random.number(10) + 1
                                            let randHours = faker.random.number(23) + 1
            
                                            let createdAt = moment().add(-randHours, 'hours').add(-randDays, 'days').format("YYYY-MM-DD HH:mm:ss")
            
                                            return Message.create({
                                                text: faker.lorem.sentences(3),
                                                createdAt: createdAt
                                            }).then(createdMessage => {
            
                                                return Promise.all([
                                                    createdMessage.setAuthor(author),
                                                    createdMessage.setChat(createdChat),
                                                ])
            
                                            })
            
                                        }))
                                        
                                    })
            
                                }))
                                )
                            ].filter(promise => typeof promise !== "undefined")
                        )
    
                    })
                ])
            })
        })
    }

    return syncDatabaseSchema().then(feed).then(() => {
        console.log('HAS FEED EVERYTHING')
    })

}

