module.exports = (sequelize, DataTypes) => {

    const MessageModel = sequelize.define('message', {

        text: {
            type: DataTypes.STRING,
            allowNull: false
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        }

    })

    return MessageModel
}