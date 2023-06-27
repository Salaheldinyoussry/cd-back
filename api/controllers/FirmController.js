
//error messages
const NECESSARY_PARAMETERS_MISSING_ERROR = {
	error: true,
	message: 'Necessary parameter(s) are missing'
}
const SERVER_ERROR = {
	error: true,
	message: 'Something went wrong on server-side'
}

const ObjectID = require("mongodb").ObjectID;


const CONTROLLER_NAME = 'FirmController'

const async = require('async')

module.exports = {


	getAllFirmDetails: async function (req, res) {
        
		sails.log.info('Entering function getAllFirmDetails in ' + CONTROLLER_NAME)

        try{



            const db =  User.getDatastore().manager;


            let firmId = req.query.firmCrd
            let date  = req.query.date

            if(!firmId){
                sails.log.error('Necessary parameter(s) are missing')
                return res.badRequest(NECESSARY_PARAMETERS_MISSING_ERROR)
            }


            firmId = firmId.padStart(24, '0');

            let pip = [];

            if(date){

                pip = [
                    { "$match": { "firmId": new ObjectID(firmId) } },
                    { "$match": { "formDate": { "$lte": new Date(date) } } },
                    { "$sort": { "formDate": -1 } },
                    { "$group": { "_id": "$formDate", "docs": { "$push": "$$ROOT" } } },
                    { "$sort": { "_id": -1 } },
                    { "$limit": 1 },
                    { "$unwind": "$docs" },
                    { "$replaceRoot": { "newRoot": "$docs" } }
                  ]
            }
            else{

                pip = [
                    { "$match": { "firmId": new ObjectID(firmId) } },
                    { "$sort": { "formDate": -1 } },
                    { "$group": { "_id": "$formDate", "docs": { "$push": "$$ROOT" } } },
                    { "$sort": { "_id": -1 } },
                    { "$limit": 1 },
                    { "$unwind": "$docs" },
                    { "$replaceRoot": { "newRoot": "$docs" } }
                  ]
            }

            let collections = await db.listCollections().toArray();

            collections = collections.map(c => c.name);
            collections = collections.filter(c => c.startsWith("IA_") && c != 'IA_Firm_latest_data')

            let XML_DATA = await db.collection('XML_DATA').find({'Info._FirmCrdNb': Number(req.query.firmCrd)}).limit(1).toArray()

            let response = {};

            response['Main'] = [flattenObject(XML_DATA[0])];


            async.eachLimit(collections, 10, async (col,callback) => {
            // do some async processing for each item
                let res = await db.collection(col).aggregate(pip).toArray()
                
                if(res.length > 0){
                    response[col] = res
                }
                callback();
            }, (err) => {
                if (err) {
                   
                    sails.log.error(err)
                    return res.serverError(SERVER_ERROR)

                } else {

                    sails.log.info('Returning from getAllFirmDetails in ' + CONTROLLER_NAME)
                    return res.ok(response)
                }
            });



        }catch(err){
            sails.log.error(err)
            return res.serverError(SERVER_ERROR)
        }


	},

    getFilingDates: async function (req, res) {
        
		sails.log.info('Entering function getFilingDates in ' + CONTROLLER_NAME)

        try{



            const db =  User.getDatastore().manager;


            let firmId = req.query.firmCrd

            if(!firmId){
                sails.log.error('Necessary parameter(s) are missing')
                return res.badRequest(NECESSARY_PARAMETERS_MISSING_ERROR)
            }


            firmId = firmId.padStart(24, '0');

            let response =  await db.collection('IA_ADV_Base_A').distinct("formDate",{firmId: new ObjectID(firmId)})
         


            sails.log.info('Returning from getFilingDates in ' + CONTROLLER_NAME)
            return res.ok(response)

        }catch(err){
            sails.log.error(err)
            return res.serverError(SERVER_ERROR)
        }


	},






};

// Check if all the fields in field list are present or not
function hasAllFields(requestObject, fields)
{
	return fields.every(k => k in requestObject)
}


function flattenObject(obj, prefix = '') {
	const flattened = {};
	for (const [key, value] of Object.entries(obj)) {
      if(key == '_id') continue;
	  const newKey = prefix ? `${prefix}.${key}` : key;
	  if (typeof value === 'object' && value !== null) {
		Object.assign(flattened, flattenObject(value, newKey));
	  } else {
		flattened[newKey] = value;
	  }
	}
	return flattened;
  }
  
  
function getQuery(operator, value){
    switch(operator){
        case 'eq':
            return { $eq: value };
        case 'neq': 
            return { $ne: value };
        case 'gt':
            return { $gt: value };
        case 'gte':
            return { $gte: value };
        case 'lt':
            return { $lt: value };
        case 'lte':
            return { $lte: value };
        case 'contains':
            return { $regex: new RegExp(value, 'i') };
        case 'ncontains':
            return { $not: { "$regex" : new RegExp(value, 'i') } };

        case 'startsWith':
            return { $regex: new RegExp('^' + value, 'i') };

        case 'endsWith':
            return { $regex: new RegExp(value + '$', 'i') };
    
        default:
            throw new Error('Invalid operator');    
        }
        
}