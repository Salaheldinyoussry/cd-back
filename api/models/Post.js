module.exports = {

	tableName: 'Post',

	attributes: {

		description: {
			type: 'string'
		},

		userId: {
			model: 'User'

		},
        images: {
            type : 'json'
        },
        comments: {
            collection : 'Comment',
            via: 'postId',

        },
        stars:{
            type: 'number',
            defaultsTo: 0
        }



	},
}