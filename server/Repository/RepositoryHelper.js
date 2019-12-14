const RepositoryHelper = {

    retrieveMessage: MessageModel => ({
        id: MessageModel.get('id'),
        createdAt: MessageModel.get('createdAt'),
        text: MessageModel.get('text'),
        author: MessageModel.get('author'),
    }),


    retrieveUser: UserModel => ({
        id: UserModel.get('id'),
        username: UserModel.get('username'),
        avatar: UserModel.get('avatar'),
    }),

}

module.exports = RepositoryHelper