module.exports = {

	tableName: 'User',

	attributes: {

		name: {
			type: 'string'
		},

		email: {
	      	type: 'string',
	      	isEmail: true,
        	unique: true,
        	minLength: 1,
        	maxLength: 256 ,
        	allowNull: true
		},

		password: {
			type:'string',
	        allowNull: false
		},


		phone: {
			type: 'string',
			allowNull: true
		},


		role :{
			type: 'string',
			isIn: ['admin', 'regular'],
            defaultsTo: 'regular'
		},
		images :{
			collection: 'Image',
			via: 'userId'
		},
		avatar :{
			type :"string",
			allowNull: true
			
			
		}


	},

	validPassword: function (customer, password) {

    	let match = false
    	let cryptoSalt = CryptoService.encryptUsingSHA256({text: password})
        let hashedPassword = CryptoService.encryptUsingSHA256({text: password, cryptoSalt: cryptoSalt})
        match = (hashedPassword === customer.password)
        return match
    },

	beforeCreate: function(attributes, proceed){
      
      	if(attributes.password){
      		let cryptoSalt = CryptoService.encryptUsingSHA256({text: attributes.password})
      		let hashedPassword = CryptoService.encryptUsingSHA256({text: attributes.password, cryptoSalt: cryptoSalt})
      		attributes.password = hashedPassword
		}
      	if(attributes.invitationCode){
      		let cryptoSalt = CryptoService.encryptUsingSHA256({text: attributes.invitationCode})
      		let hashedInvitationCode = CryptoService.encryptUsingSHA256({text: attributes.invitationCode, cryptoSalt: cryptoSalt})
      		attributes.invitationCode = hashedInvitationCode
		}

		return proceed()
	},
	
	beforeUpdate: function(attributes, proceed){
      
      	if(attributes.password){
      		let cryptoSalt = CryptoService.encryptUsingSHA256({text: attributes.password})
      		let hashedPassword = CryptoService.encryptUsingSHA256({text: attributes.password, cryptoSalt: cryptoSalt})
      		attributes.password = hashedPassword
		}
      	if(attributes.invitationCode){
      		let cryptoSalt = CryptoService.encryptUsingSHA256({text: attributes.invitationCode})
      		let hashedInvitationCode = CryptoService.encryptUsingSHA256({text: attributes.invitationCode, cryptoSalt: cryptoSalt})
      		attributes.invitationCode = hashedInvitationCode
		}

		return proceed()
	},
}