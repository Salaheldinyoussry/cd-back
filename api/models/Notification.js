module.exports = {

	tableName: 'Notification',

	attributes: {

		userId: {
			model: 'User'
		},

        postId: {
			model: 'Post'
		},

        image: {
            type : 'json'
        },
		
		description: {
			type: 'string'
		}

	},
}