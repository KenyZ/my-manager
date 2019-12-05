const faker = require('faker')
const moment = require('moment')

const {database, models} = require('./DatabaseInstance')


if(database && models){

    let action = feedDatabase


    action().finally(() => {
        console.log('### ALL ENDED ###')
        // process.exit(0)
    })
}


function syncDatabaseSchema(){
    return database.sync({force: true}).then(() => {
        console.log('DATABASE SCHEMA HAS BEEN SYNCED')
    })
}


function feedDatabase(){

    const {User, Chat, Message} = models

    const feed = () => {

        console.log('WILL FEED')

        return User.bulkCreate([
            {username: 'tom', password: '1234', avatar: "https://picsum.photos/id/10/300/300"},
            {username: 'kev', password: '1234', avatar: "https://picsum.photos/id/22/300/300"},
            {username: 'mat', password: '1234', avatar: "https://picsum.photos/id/33/300/300"},
            {username: 'raf', password: '1234', avatar: "https://picsum.photos/id/43/300/300"},
            {username: 'seb', password: '1234', avatar: "https://picsum.photos/id/53/300/300"},
            {username: 'guy', password: '1234', avatar: "https://picsum.photos/id/45/300/300"},
            {username: 'paul', password: '1234', avatar: "https://picsum.photos/id/37/300/300"},
            {username: 'val', password: '1234', avatar: "https://picsum.photos/id/7/300/300"},
        ]).then(createdUsers => {

            console.log('Users created ' + createdUsers.length)

            const pairs = [
                [createdUsers[0], createdUsers[1]],
                [createdUsers[0], createdUsers[3]],

                [createdUsers[1], createdUsers[4]],
                [createdUsers[1], createdUsers[5]],
                [createdUsers[1], createdUsers[2]],

                [createdUsers[2], createdUsers[3]],
                [createdUsers[2], createdUsers[4]],

                [createdUsers[3], createdUsers[1]],
            ]

            return Promise.all(
                pairs.map(pairsItem => {

                    return Chat.create({}).then(createdChat => {

                        return createdChat.setParticipants(pairsItem).then(() => {

                            const nMessages = faker.random.number(10) + 1

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

                    })

                })
            )
        })
    }

    return syncDatabaseSchema().then(feed).then(() => {
        console.log('HAS FEED EVERYTHING')
    })

}

