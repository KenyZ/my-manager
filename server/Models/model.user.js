
module.exports = (sequelize, DataTypes) => {

    const UserModel = sequelize.define('user', {

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