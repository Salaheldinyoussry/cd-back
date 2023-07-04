/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': { view: 'pages/homepage' },

  'post /login' : 'UserController.login',
  'post /signup' : 'UserController.signup',
  'get /logout' : 'UserController.logout',
  'get /user' : 'UserController.get',
  'post /edit' : 'UserController.edit',
  'get /notify' : 'UserController.getNotify',
  'post /reportBug' : 'UserController.reportBug',
  'post /follow' : 'UserController.follow',
  'post /unfollow' : 'UserController.unfollow',

  'get /firm/all' : 'FirmController.getAllFirmDetails',
  'get /search/fields' : 'SearchController.getSearchFields',
  'get /search/labels' : 'SearchController.getLabels',
  'post /search/count' : 'SearchController.searchCount',
  'post /reportBug' : 'UserController.reportBug',

  'post /image/upload' : 'ImageController.uploadImage',
  'get /image' : 'ImageController.getImages',

  'post /search' : 'SearchController.search',
  'get /firm/filingdates' : 'FirmController.getFilingDates',
  'post /import' : 'ImportController.importAll',
  'get /import/status' : 'ImportController.importStatus',


  'get /post/feed' : 'PostController.getFeed',
  'post /post/filter' : 'PostController.filterPosts',
  'post /post' : 'PostController.create',
  'post /post/delete' : 'PostController.delete',
  'post /post/edit' : 'PostController.edit',
  'get /post' : 'PostController.getPosts',
  'get /post/notify' : 'PostController.getPost',

  'post /post/star' : 'PostController.star',
  'post /post/comment' : 'PostController.comment',
  'get /post/comment' : 'PostController.getComments',


  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
