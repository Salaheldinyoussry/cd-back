module.exports = {

	tableName: 'Star',

	attributes: {

		postId: {
			model: 'Post'
		},

		userId: {
			model: 'User'

		}

	},
}