module.exports = (DatabaseInstance, DataTypes) => {

    const MessageModel = DatabaseInstance.define('message', {

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