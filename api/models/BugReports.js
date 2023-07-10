module.exports = {

	tableName: 'BugReports',

	attributes: {

		userId: {
			model: 'User'
		},

		title: {
			type: 'string'
		},

		description: {
			type: 'string'
		}

	},

}