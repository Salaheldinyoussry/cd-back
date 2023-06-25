const crypto    = require('crypto')

const IV_BYTE_LENGTH_AES_256 = 16
const KEY_LENGTH_AES_256 = 32
const KEY_LENGTH_SHA_256 = 64

module.exports = {

	encryptUsingSHA256: function (options) {
		try{
			let algorithm = 'sha256'
			let cryptoSalt = options.cryptoSalt?options.cryptoSalt:process.env.CRYPTO_SALT
			let key  = crypto.scryptSync(process.env.CRYPTO_PASSWORD , cryptoSalt, KEY_LENGTH_SHA_256)
			let hash = crypto.createHmac(algorithm, key)
	                   .update(options.text)
	                   .digest('hex')
	        return hash
	    }
	    catch (error) {
	    	sails.log.error(error)
			return null
	    }
	},
 
	encryptUsingAES256: function (options){
		try{
		    let algorithm = "aes-256-cbc"
		    let cryptoSalt = options.cryptoSalt?options.cryptoSalt:process.env.CRYPTO_SALT
		    let key  = crypto.scryptSync(process.env.CRYPTO_PASSWORD , cryptoSalt, KEY_LENGTH_AES_256)
		    let ivSalt = options.ivSalt?options.ivSalt:process.env.IV_SALT
		    let iv = crypto.scryptSync(process.env.IV_PASSWORD , ivSalt, IV_BYTE_LENGTH_AES_256) 
		    let cipher = crypto.createCipheriv(algorithm, key, iv)
		    let crypted = cipher.update(options.text, 'utf8', 'hex')
		    crypted += cipher.final('hex') 
		    return crypted
		}
		catch (error) {
			sails.log.error(error)
			return null
		}
	},
	 
	decryptUsingAES256: function (options){
		try {
		    let algorithm = "aes-256-cbc"
		    let cryptoSalt = options.cryptoSalt?options.cryptoSalt:process.env.CRYPTO_SALT
		    let key  = crypto.scryptSync(process.env.CRYPTO_PASSWORD , cryptoSalt, KEY_LENGTH_AES_256)
		    let ivSalt = options.ivSalt?options.ivSalt:process.env.IV_SALT
		    let iv = crypto.scryptSync(process.env.IV_PASSWORD , ivSalt, IV_BYTE_LENGTH_AES_256) 
		    let decipher = crypto.createDecipheriv(algorithm, key, iv)
		    let decrypted = decipher.update(options.text, 'hex', 'utf8')
		    decrypted += decipher.final('utf8')
		    return decrypted
		}
		catch (error) {
			sails.log.error(error)
			return null
		}
	}
};