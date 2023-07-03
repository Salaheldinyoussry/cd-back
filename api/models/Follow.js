module.exports = {

	tableName: 'Follow',

	attributes: {

		followerId: {
			model: 'User',
			required: true
		},
	
		followeeId: {
			model: 'User',
			required: true
		},

	},
}