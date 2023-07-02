
//error messages
const NECESSARY_PARAMETERS_MISSING_ERROR = {
	error: true,
	message: 'Necessary parameter(s) are missing'
}
const SERVER_ERROR = {
	error: true,
	message: 'Something went wrong on server-side'
}



const CONTROLLER_NAME = 'SearchController'



module.exports = {


	getSearchFields: async function (req, res) {
        
		sails.log.info('Entering function getSearchFileds in ' + CONTROLLER_NAME)

        try{
            const db =  User.getDatastore().manager;

            let schema = await db.collection('Schema').findOne({});
            delete schema._id;
            schema = {XML_DATA: schema['XML_DATA'], ...schema};

            let response = {
                schema: schema
            }


            sails.log.info('Returning from getSearchFileds in ' + CONTROLLER_NAME)
            return res.ok(response)

        }
        catch(err){
            sails.log.error(err)
            return res.serverError(SERVER_ERROR)
        }


	},
	searchCount: function (req, res) {
        sails.log.info('Entering function searchCount in ' + CONTROLLER_NAME)
   
        try{

            let filters = req.body.filters;
            let any = req.body.any;

            let limit = req.query.limit ? parseInt(req.query.limit) : 10;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;

            let Allqueries = [];

            filters.forEach(filter => {
                let query = {};
                query[filter.field] = getQuery(filter.operator, filter.value);
                Allqueries.push(query);
            });

            let agg = any=='true' || any == true ? { $or: Allqueries } : { $and: Allqueries };

            if(!filters || !filters.length) agg = {};

            const db =  User.getDatastore().manager;

            let collection = db.collection('IA_Firm_latest_data');

            collection.find(agg).count(function(err, count) {
                if (err) throw err;


                sails.log.info('Returning from searchCount in ' + CONTROLLER_NAME)
                
                


                return res.ok({count: count})
            })



        }catch(err){
            sails.log.error(err)
            return res.serverError(SERVER_ERROR)
        }

	},
    
	search: function (req, res) {
        sails.log.info('Entering function search in ' + CONTROLLER_NAME)
   
        try{

            let filters = req.body.filters;
            let any = req.body.any;

            let limit = req.query.limit ? parseInt(req.query.limit) : 10;
            let skip = req.query.skip ? parseInt(req.query.skip) : 0;

            let Allqueries = [];

            filters.forEach(filter => {
                let query = {};
                query[filter.field] = getQuery(filter.operator, filter.value);
                Allqueries.push(query);
            });

            let agg = any=='true' || any == true ? { $or: Allqueries } : { $and: Allqueries };

            if(!filters || !filters.length) agg = {};

            const db =  User.getDatastore().manager;

            let collection = db.collection('IA_Firm_latest_data');

            collection.find(agg).skip(skip).limit(limit).toArray(function(err, result) {
                if (err) throw err;

                result.forEach((item, index) => {
                    let arrayRefs = getArrayReferences(item);
                    filterArrays(arrayRefs, filters)
                    updateObj(arrayRefs, item);

                });



                sails.log.info('Returning from search in ' + CONTROLLER_NAME)
                
                


                return res.ok(result)
            })



        }catch(err){
            sails.log.error(err)
            return res.serverError(SERVER_ERROR)
        }

	},

    getLabels: async function (req, res) {
        sails.log.info('Entering function getLabels in ' + CONTROLLER_NAME)
   
        try{

            const db =  User.getDatastore().manager;

            let collection = db.collection('KeysLabels');

            collection.find({}).toArray(function(err, result) {
                if (err) throw err;

                sails.log.info('Returning from search in ' + CONTROLLER_NAME)
                return res.ok(result)
            })



        }catch(err){
            sails.log.error(err)
            return res.serverError(SERVER_ERROR)
        }
    }



};

function filterArrays(arrayRefs, filters) {
    arrayRefs.forEach(arrayRef => {
        filters.forEach(filter => {
           // arrayRef.ref = getFilteredArray(arrayRef.ref, [filter]);
           let field = filter.field.split('.');
           let last = field.pop();
           field = field.join('.')
           

           if( typeof arrayRef.ref[0] == 'object' && arrayRef.path.join('.') == field){
            arrayRef.ref = helper(arrayRef.ref, last, filter.operator,filter.value);
           }
           else if (typeof arrayRef.ref[0] != 'object' && arrayRef.path.join('.') == filter.field){
            arrayRef.ref = helper2(arrayRef.ref, filter.value, filter.operator);
            //console.log("arrayRef.ref" , arrayRef.ref)
           }
           

        });
    });
  }

function helper2 (array , value, operator){
     array = array.filter(item => { 
        // console.log("item" , item , value , operator, filterOperator(operator, value, item))
        return filterOperator(operator, value, item)    
    })
    return array;
    
}

function helper (array , field, operator ,value){
  let newArray = [];
    array.forEach(item => {
        console.log("item" , item , value , operator, filterOperator(operator, value, item[field]))
        if(filterOperator(operator, value, item[field])){
            newArray.push(item);
        }
    })

    return newArray;

}


function getArrayReferences(obj, path = []) {
    let arrayRefs = [];
  
    for (let key in obj) {
      if (Array.isArray(obj[key])) {
        arrayRefs.push({ path: [...path, key], ref: obj[key] });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        arrayRefs = arrayRefs.concat(getArrayReferences(obj[key], [...path, key]));
      }
    }
  
    return arrayRefs;
  }

function updateObj(arrayRefs , obj){

    arrayRefs.forEach(arrayRef => {
        let temp = obj;
        arrayRef.path.forEach((key, index) => {
            if(index == arrayRef.path.length-1){
                temp[key] = arrayRef.ref;
            }else{
                temp = temp[key];
            }
        });
    });

    return obj;

}


function getFilteredArray(array, filters){
    let filteredArray = [];
    array.forEach(item => {
        let flag = false;
        filters.forEach(filter => {
            let field = filter.field.split('.');
            field.shift();
            field = field.join('.');

            // console.log("lop" ,filter.field , field , item)
            if(!filterOperator(filter.operator, filter.value, item[filter.field.split('.')[1]])){
                flag = true;
            }
        });
        if(flag) filteredArray.push(item);

    });
    return filteredArray;
}

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

function filterOperator (operator, value, field){
    // console.log(operator, value, field)
    switch(operator){
        case 'eq':
            return value == field;
        case 'neq':
            return value != field;
        case 'gt':
            return value > field;
        case 'gte':
            return value >= field;
        case 'lt':
            return value < field;
        case 'lte':
            return value <= field;
        case 'contains':
            field = field && field.toString();
            if (!field) return false;

            field = field.toLowerCase();
            value = value.toString().toLowerCase();

            return field && field.includes(value);
        case 'ncontains':
            field = field && field.toString();
            if (!field) return false;

            field = field.toLowerCase();
            value = value.toString().toLowerCase();

            return field && !field.includes(value);
        case 'startsWith':
            field = field && field.toString();
            if (!field) return false;

            field = field.toLowerCase();
            value = value.toString().toLowerCase();

            return field && field.startsWith(value);
        case 'endsWith':
            field = field && field.toString();
            if (!field) return false;

            field = field.toLowerCase();
            value = value.toString().toLowerCase();

            return field && field.endsWith(value);
        default:
            throw new Error('Invalid operator');

    }

}