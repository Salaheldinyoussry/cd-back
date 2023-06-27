
//error messages
const NECESSARY_PARAMETERS_MISSING_ERROR = {
	error: true,
	message: 'Necessary parameter(s) are missing'
}
const SERVER_ERROR = {
	error: true,
	message: 'Something went wrong on server-side'
}

const INVALID_CREDENTIALS = {
	error: true,
	message: 'Email or password is wrong'
}

const loginInputFields = ['email',	'password']

const reportBugFields = ['Title', 'Description']

const CONTROLLER_NAME = 'UserController'

const JWT = require('jsonwebtoken')


module.exports = {


	login: function (req, res) {
		sails.log.info('Entering function login in ' + CONTROLLER_NAME)

		// Check if body and all neccesary body parameters are present
		if(!req.body || !hasAllFields(req.body, loginInputFields)) {
			sails.log.error('Neccesary parameter(s) are missing')
			return res.badRequest(NECESSARY_PARAMETERS_MISSING_ERROR)
		}		

		sails.log.info('DB query to find user')
    	User
    	.findOne({email: req.body.email})
    	.exec(function(error, user) {

	        if (error) {
	            sails.log.error(error)
	            return res.serverError(SERVER_ERROR)
	        }

	        if (!user) {
	            sails.log.error('No user found for this email');
	            return res.badRequest(INVALID_CREDENTIALS)
	        }

	        // Validate the password
	        sails.log.info('Validating Password')
	        let match = User.validPassword(user, req.body.password)

	        if (!match) {
	            sails.log.error('Error while validating password')
	            return res.badRequest(INVALID_CREDENTIALS)
        	}


        	// Generate a JWT token
			// We are using a combination of static jwt secret from env vars and the hash of user password as JWT Secret
			// This is done to make sure that the previously constructed tokens get invalidated if the user updates the password
			let jwtSecret = process.env.JWT_SECRET + '-' + user.password
        	sails.log.info('Generating a JWT token')
			let token = JWT.sign({userId: user.id}, jwtSecret)


			let response = {
				userId: user.id,
				role: user.role,
				token:token
				
			}


            res.setHeader('set-cookie', [
                '_ria=' + token + '; Max-Age=' + 3600*5 +  ';  SameSite=None;',
            ])


			sails.log.info('Returning from login in ' + CONTROLLER_NAME)
			return res.ok(response)	
        })		
	},

	signup: function (req, res) {
		let userObj = req.body
		console.log(userObj)

		if(!userObj || !hasAllFields(userObj, ['email', 'password', 'name'])) {
			sails.log.error('Neccesary parameter(s) are missing')
			return res.badRequest(NECESSARY_PARAMETERS_MISSING_ERROR)	
		}

		User 
		.create(userObj)
		.fetch()
		.exec(function (error, record) {
	
			if(error){
				sails.log.error(error)
				return res.serverError(error)

			}

			return res.ok(record)
		})


	},
	get : function (req, res) {
		let userId = req.user.id

		User.findOne({id: userId}).exec(function (error, record) {
				
			if(error){
				sails.log.error(error)
				return res.serverError(error)

			}
			delete record.password

			return res.ok(record)
		})

	},
	reportBug: function (req, res) {
		let report = req.body
		console.log(report)
		if(!report || !hasAllFields(report, reportBugFields)) {
			sails.log.error('Neccesary parameter(s) are missing')
			return res.badRequest(NECESSARY_PARAMETERS_MISSING_ERROR)	
		}
		BugReports
		.create(report)
		.fetch()
		.exec(function (error, record) {
	
			if(error){
				sails.log.error(error)
				return res.serverError(error)

			}

			return res.ok(record)
		})

	}


};

// Check if all the fields in field list are present or not
function hasAllFields(requestObject, fields)
{
	return fields.every(k => k in requestObject)
}


function flattenObject(obj, prefix = '') {
	const flattened = {};
	for (const [key, value] of Object.entries(obj)) {
	  const newKey = prefix ? `${prefix}.${key}` : key;
	  if (typeof value === 'object' && value !== null) {
		Object.assign(flattened, flattenObject(value, newKey));
	  } else {
		flattened[newKey] = value;
	  }
	}
	return flattened;
  }
  
  