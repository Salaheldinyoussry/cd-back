module.exports = {

	tableName: 'Image',

	attributes: {

		url: {
			type: 'string'
		},

		type :{
			type: 'string',
			isIn: ['mask', 'regular'],
            defaultsTo: 'regular'
		},
		userId: {
			model: 'User'

		}

	},
}