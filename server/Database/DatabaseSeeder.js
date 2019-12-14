const faker = require('faker')
const moment = require('moment')

const {database, models} = require('./sequelize')


if(database && models){

    let action = feedDatabase


    action().finally(() => {

        const {User, Chat, Message} = models



        // return Promise.all([

        //     User.bulkCreate([
        //         {
        //             username: 'harry',
        //             password: 'houhou',
        //             avatar: 'ggerge'
        //         },
        //         {
        //             username: 'hehe',
        //             password: 'houhou',
        //             avatar: 'ggerge'
        //         }
        //     ]).then(users => {

        //         console.log({
        //             user: {
        //                 a: users[0].getDiscussions,
        //                 b: users[0].getDiscussion,
        //                 c: users[0].getChat,
        //                 d: users[0].getChats,
        //             }
        //         })
    
        //         return users[0].addContact(users[1]).then(() => {

        //             return Chat.create({

        //             }).then(chat => {
        //                 return Promise.all([
        //                     chat.setParticipants(users),
        //                 ])
        //             })

        //         })
    
        //     }),



        // ])


        console.log('### ALL ENDED ###')
        // process.exit(0)
    })
}


function syncDatabaseSchema(){
    return database.sync({force: true}).then(() => {
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
            Array(50).fill(true).map(_ => {
                return {
                    username: faker.internet.userName(), 
                    password: '1234', 
                    avatar: faker.internet.avatar()
                }
            })
        ).then(createdUsers => {

            console.log('Users created ' + createdUsers.length)


            const generatingPairs = generateUniquePairs(createdUsers, () => faker.random.number(10) + 1).then(generatedPairs => {

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
    
                        return Promise.all(
                            [

                                pairsItem[0].addContact(pairsItem[1]),
                                pairsItem[1].addContact(pairsItem[0]),

                                (Math.random() > .3 && (Chat.create({}).then(createdChat => {
        
                                    return createdChat.setParticipants(pairsItem).then(() => {
            
                                        const nMessages = faker.random.number(30) + 1
            
                                        return Promise.all(Array(nMessages).fill(true).map((_, i) => {
            
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
                                                    // createdMessage.setTarget(target),
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

