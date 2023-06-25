const { BlobServiceClient } = require('@azure/storage-blob');

const connectionString = 'DefaultEndpointsProtocol=https;AccountName=gradpro;AccountKey=Mnl4U8XG5HKcMiE5VXESSMoAN7jtArsROWAL6fTG/Q+8MSsfrcwdKkLHOpKTHzfn87tDG2aDDgj3+AStujKynA==;EndpointSuffix=core.windows.net';

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

const { v4: uuidv4 } = require('uuid');

module.exports = {

  uploadFile: async function(containerName='imgs', file, options = {}) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Define the file name and options for the uploaded file
    const originalFileName = file._files[0].stream.filename;
    const fileExtension = originalFileName.split('.').pop();
    const fileName = `${uuidv4()}-${originalFileName}`;
    const fileOptions = {
      blobHTTPHeaders: {
        blobContentType: file._files[0].stream.headers['content-type']
      }
    };

    // Upload the file to the container and return the public URL
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadStream(file._files[0].stream, undefined, undefined, fileOptions);

    return blockBlobClient.url;
  }

};