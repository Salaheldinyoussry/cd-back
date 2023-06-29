module.exports = {

	tableName: 'Notification',

	attributes: {

		description: {
			type: 'string'
		},

		userId: {
			model: 'User'
		},

        postId: {
			model: 'Post'
		},

        image: {
            type : 'json'
        }

	},
}