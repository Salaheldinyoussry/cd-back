
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


const CONTROLLER_NAME = 'ImportController'




module.exports = {


	importAll: async function (req, res) {
		sails.log.info('Entering function importAll in ' + CONTROLLER_NAME)
		
		try{

			if(!req.body.riaUrl || !req.body.eraUrl)
				return res.badRequest(NECESSARY_PARAMETERS_MISSING_ERROR)


			const db =  User.getDatastore().manager;
			let config =  await db.collection('_config').findOne({});

			if(config.import && config.import.status != 'notRunning')
				return res.serverError({message: 'Import is already running'})

			config.import = {
				status: 'run',
				riaUrl: req.body.riaUrl,
				eraUrl: req.body.eraUrl
			}
			await db.collection('_config').updateOne({}, {$set: {import: config.import}})

			sails.log.info('Leaving function importAll in ' + CONTROLLER_NAME)
			return res.ok({status: 'running'})

		}catch(err){
			sails.log.error(err)
			return res.serverError(SERVER_ERROR)
		}



	
	},

	importStatus : async function (req, res) {
        sails.log.info('Entering function importStatus in ' + CONTROLLER_NAME)

		try{
			const db =  User.getDatastore().manager;
			let config =  await db.collection('_config').findOne({});

				
			if(config.import && config.import.status != 'notRunning')

				return res.ok({status: 'running'})

			
			
			sails.log.info('Leaving function importStatus in ' + CONTROLLER_NAME)

			return res.ok({status: 'notRunning'})
		
		}catch(err){
			sails.log.error(err)
			return res.serverError(SERVER_ERROR)
		}
		
	
	
	}


};

  