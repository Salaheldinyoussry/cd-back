module.exports = {

	tableName: 'Comment',

	attributes: {

		text: {
			type: 'string',
            required: true
		},

		userId: {
			model: 'User',
            required: true

		},
        postId :{
            model: 'Post',
            required: true
        }


	},
}