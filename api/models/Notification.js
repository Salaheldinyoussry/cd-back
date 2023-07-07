module.exports = {

	tableName: 'Notification',

	attributes: {

		userId: {
			model: 'User'
		},

        postId: {
			model: 'Post'
		},
		description: {
			type: 'string'
		}

	},
}