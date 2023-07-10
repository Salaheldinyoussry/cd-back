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

const loginInputFields = ['email',	'password'];
const reportBugFields = ['title', 'description'];

const CONTROLLER_NAME = 'UserController'

const JWT = require('jsonwebtoken');
//const Follow = require('../models/Follow');


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
			let jwtSecret = /*process.env.JWT_SECRET*/"testtest" + '-' + user.password 
        	sails.log.info('Generating a JWT token')
			let token = JWT.sign({userId: user.id}, jwtSecret)

			let response = {
				userId: user.id,
				role: user.role,
				token: token
			}

            res.setHeader('set-cookie', [
                '_ria=' + token + '; Max-Age=' + 3600*5 +  ';  SameSite=None;',
            ])

			sails.log.info('Returning from login in ' + CONTROLLER_NAME)
			return res.ok(response)	
        })		
	},

	logout: function (req, res) {
		sails.log.info('Entering function logout in ' + CONTROLLER_NAME);

		User
    	.findOne({id: req.user.id})
    	.exec(function(error, user) {

			if(error) {
	            sails.log.error(error)
	            return res.serverError(SERVER_ERROR)
	        }

	        if(!user) {
	            sails.log.error('No user found for this email');
	            return res.badRequest(INVALID_CREDENTIALS)
	        }

			return res.ok({ success: true });	
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

	edit: async function (req, res) {
		let newUser = req.body
		console.log(newUser);

		if(newUser.editType==="name") {
			User.updateOne({id: req.user.id}).set({name: newUser.name}).exec(function (error, record) {
				if(error) {
					sails.log.error(error)
					return res.serverError(error)
				}
				delete record.password
	
				return res.ok(record)
			});
		}
		else if(newUser.editType==="email") {
			User.updateOne({id: req.user.id}).set({email: newUser.email}).exec(function (error, record) {
				if(error) {
					sails.log.error(error)
					return res.serverError(error)
				}
				delete record.password
	
				return res.ok(record)
			});
		}
		else if(newUser.editType==="job") {
			User.updateOne({id: req.user.id}).set({job: newUser.job}).exec(function (error, record) {
				if(error) {
					sails.log.error(error)
					return res.serverError(error)
				}
				delete record.password
	
				return res.ok(record)
			});
		}
		else if(newUser.editType==="phone") {
			User.updateOne({id: req.user.id}).set({phone: newUser.phone}).exec(function (error, record) {
				if(error) {
					sails.log.error(error)
					return res.serverError(error)
				}
				delete record.password
	
				return res.ok(record)
			});
		}
		else if(newUser.editType==="avatar") {
			User.updateOne({id: req.user.id}).set({avatar: newUser.avatar}).exec(function (error, record) {
				if(error) {
					sails.log.error(error)
					return res.serverError(error)
				}
				delete record.password
	
				return res.ok(record)
			});
		}
		else if(newUser.editType==="cover") {
			User.updateOne({id: req.user.id}).set({cover: newUser.cover}).exec(function (error, record) {
				if(error) {
					sails.log.error(error)
					return res.serverError(error)
				}
				delete record.password
	
				return res.ok(record)
			});
		}
	},

	get: function(req, res) {
		let userId = req.query.profileId?req.query.profileId:req.user.id;

		User.findOne({id: userId}).populate('followers').exec(function (error, record) {
			console.log(record);
			if(error) {
				sails.log.error(error)
				return res.serverError(error)
			}
			delete record.password

			return res.ok(record)
		})
	},

	getNotify: function(req, res) {
		Notification.find({postOwnerId: req.user.id}).exec(function (error, records) {
			if(error) {
				console.log(records);
				sails.log.error(error)
				return res.serverError(error)
			}

			return res.ok(records)
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
		.create({userId: req.user.id, title: report.title, description: report.description})
		.fetch()
		.exec(function (error, record) {

			if(error){
				sails.log.error(error)
				return res.serverError(error)

			}

			return res.ok(record)
		})

	},

	follow: function (req, res) { 
		let newRecord = { followerId: req.user.id, followeeId: req.body.followeeId };
		Follow.findOne(newRecord).exec(function (error, record) {
			if(error) {
				sails.log.error(error)
				return res.serverError(error)
			}

			if(!record) {
				Follow.create(newRecord).fetch().exec(function (error, record) {
					console.log(record);
					if(error) {
						sails.log.error(error)
						return res.serverError(error)
					}
						
					if(record) {
						return res.ok({ success: true })
					}
				});
			}
			else {
				return res.ok({ success: false })
			}
		});
	},

	unfollow: async function (req, res) { 
		let record = { followerId: req.user.id, followeeId: req.body.followeeId };
	    await Follow.destroy(record)

		return res.ok({ success: true })
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
  
  