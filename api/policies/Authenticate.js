// Node modules
const JWT = require('jsonwebtoken')

// Error Messages
const SERVER_ERROR = {
	error: true,
	message: 'Something went wrong on server-side'
}
const AUTHORIZATION_HEADER_ERROR = {
	error: true,
	message: "Invalid Authorization Header"
}
const INVALID_TOKEN_ERROR = {
	error: true,
	message: "Invalid JWT Token"
}
const FORBIDDEN_ERROR = {
	error: true,
	message: "You are not permitted to perform this action"
}


module.exports = function (req, res, proceed)  {

		sails.log.info('Entering Authenticate Policy')


		// If one exists, attempt to get the header data
		let token = req.cookies._ria || (req.header('authorization') && req.header('authorization').split('Bearer ')[1]);


		// If there's nothing after "Bearer", send an error
		if(!token) {
			sails.log.error('JWT token not provided in the cookie header')
			return res.status(401).send(AUTHORIZATION_HEADER_ERROR)
		}

		// If there is something, attemp to decode the payload
		sails.log.info('Decoding payload of the JWT')
		let decodedPayload = JWT.decode(token)

		// If there's no userId in the token payload, send an error
		if(!decodedPayload.userId) {
			sails.log.error('No user Id in JWT payload')
			return res.status(401).send(INVALID_TOKEN_ERROR)
		}

		let decodedUserId = decodedPayload.userId

		// If userId is present in req params, verify that
		if(req.params.userId) {
			// Match userId from token with userId from request
			if(decodedUserId != req.params.userId) {
				sails.log.error('UserId from JWT doesn\'t match with userId in request')
				return res.forbidden(FORBIDDEN_ERROR)
			}
		}

		// Try to look up the user via this decoded payload userId
		sails.log.info('DB query to findOne User')
		User 
		.findOne({id: decodedUserId})
		.exec(function (error, user) {

			if(error) {
				sails.log.error(error)
				return res.serverError(error)
			}

			// If the user can't be found, send an error
			if(!user) {
				sails.log.error('No user found')
				return res.forbidden(FORBIDDEN_ERROR)
			}


			// Verify the signature of the jwt
			// We are using a combination of static jwt secret from env vars and the hash of user password as JWT Secret
			// This is done to make sure that the previously constructed tokens get invalidated if the user updates the password
			let jwtSecret = process.env.JWT_SECRET + '-' + user.password
			sails.log.info('Verifying the signature of the JWT')
			JWT.verify(token, jwtSecret, function (error, payload) {

				// If there's an error verifying the token (e.g. it's invalid or expired), Send an error
				if(error) {
					sails.log.error(error)
					return res.status(401).send(INVALID_TOKEN_ERROR)
				}

				
				req.user = user

				sails.log.info('Returning from Authenticate policy')
				return proceed()
			})
		})
	
};