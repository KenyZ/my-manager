
module.exports = (sequelize, Datatypes) => {

    const UserContact = sequelize.define('UserContact', {

    }, {
        timestamps: false,
        tableName: 'user_contacts',
        name: {
            singular: 'user_contact',
            plural: 'user_contacts'
        }
    })

    return UserContact
}