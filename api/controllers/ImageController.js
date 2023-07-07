
module.exports = {

    uploadImage: async function(req, res) {
      try{
        // Get the uploaded file from the request
        const uploadedFile = req.file('file');
        let type = req.body.type=='mask'?'mask':'regular';

        // Upload the file to Azure Blob Storage
        const publicUrl = await FileUploadService.uploadFile('imgs', uploadedFile);
        await Image.create({url: publicUrl, userId: req.user.id ,type: type});

        console.log("url", publicUrl);

        // Return the public URL of the uploaded file as a response
        return res.json({ url: publicUrl });
      }
      catch(e) {
        return res.serverError(e);
      }
    },

    getImages: async function(req, res) {
      // Get the userId from the request
      const userId = req.user.id;
      try{
        let images =  await Image.find({userId: userId})

        return res.json({ images: images });
      }
      catch(e) {
        return res.serverError(e);
      }
    }

  
  };


  