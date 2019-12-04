module.exports = (database, models) => {

    const {User} = models

    return {

        getInfo: id => {
            return User.findByPk(id, {
                attributes: ['username']
            })
        },

        findById: id => {
            return User.findByPk(id)
        },

        login: (username = "", password = "") => {
            return User.findOne({where: {username, password}}).then(userFound => {
                return userFound && {
                    id: userFound.get('id'),
                }
            })
        }
    }

}