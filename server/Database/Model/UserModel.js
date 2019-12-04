
module.exports = (DatabaseInstance, DataTypes) => {

    const UserModel = DatabaseInstance.define('user', {

        username: {
            type: DataTypes.STRING,
            allowNull: false
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        avatar: {
            type: DataTypes.STRING,
            allowNull: false
        }

    })

    return UserModel
}