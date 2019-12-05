const RepositoryHelper = {

    retrieveMessage: ({Message = null, User = null}) => (
        {
            model: Message,
            attributes: ['id', 'text', 'createdAt'],
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'avatar']
                }
            ]
        }
    )

}

module.exports = RepositoryHelper