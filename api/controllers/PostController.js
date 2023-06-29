
module.exports = {

    getFeed: async function(req, res) {
        try{

            let limit = req.query.limit?req.query.limit:10
            let skip = req.query.skip?req.query.skip:0

            let posts = await Post.find({}).populate('userId').populate('comments').sort('createdAt DESC').limit(limit).skip(skip)

            return res.json({ posts: posts });
        }
        catch(e){
          return res.serverError(e);
        }
      
    },

    getPosts : async function(req, res) {

        try{
            let limit = req.query.limit?req.query.limit:10
            let skip = req.query.skip?req.query.skip:0

            let posts = await Post.find({userId: req.user.id}).populate('userId').populate('comments').sort('createdAt DESC').limit(limit).skip(skip)

            return res.json({ posts: posts });

        }
        catch(e){
            return res.serverError(e);
        }

    },

    filterPosts: async function(req, res) {

        try{
            const query = req.body;
            let limit = query.limit?query.limit:10
            let skip = query.skip?query.skip:0
            let posts;
            console.log(query.filterType, query.searchFilter);
            if(query.filterType === "description") {
                posts = await Post.find({description: query.searchFilter}).populate('userId').populate('comments').sort('createdAt DESC').limit(limit).skip(skip)
                //posts = await Post.find({description: {"$regex": new RegExp(query.searchFilter, 'i')}}).populate('userId').populate('comments').sort('createdAt DESC').limit(limit).skip(skip)
            }
            else if(query.filterType === "user") {
                user = await User.findOne({name: query.searchFilter});
                posts = await Post.find({userId: user.id}).populate('userId').populate('comments').sort('createdAt DESC').limit(limit).skip(skip)
            }
            return res.json({ posts: posts });
        }
        catch(e){
            return res.serverError(e);
        }

    },

    create: async function(req, res) {
        try{
    
            let description = req.body.description
            let images = req.body.images
    
            let post = await Post.create({description: description, images: images, userId: req.user.id}).fetch()
    
            return res.json({ post: post });    

        }catch(e){
            return res.serverError(e);
        }
    },

    star: async function(req, res) {
        try{
            let star = req.body.star
            let postId = req.body.postId

            if(star){
                await Star.create({postId: postId, userId: req.user.id})
                await Post.update({id: postId}).set({stars: req.body.stars+1})
            }else{
                await Star.destroy({postId: postId, userId: req.user.id})
                await Post.update({id: postId}).set({stars: req.body.stars-1})
            }

            return res.ok({ success: true });

        }catch(error){

            return res.serverError(error);

        }

    },

    comment: async function(req, res) {
        try{
            let comment = req.body.comment
            let postId = req.body.postId

            let rec = await Comment.create({postId: postId, userId: req.user.id, text: comment}).fetch()

            return res.ok({ comment:rec });

        }catch(error){

            return res.serverError(error);

        }

    },
    getComments: async function(req, res) {
        try{

            let postId = req.query.postId

            let comments = await Comment.find({postId: postId}).populate('userId')

            return res.ok({ comments: comments });

        }catch(error){

            return res.serverError(error);

        }

    }



  
  };


  