module.exports = {

    getFeed: async function(req, res) {
        try{
            let limit = req.query.limit?req.query.limit:10
            let skip = req.query.skip?req.query.skip:0

            // get posts from followed profiles
            let follow = await Follow.find({ followerId: req.user.id });
            let followees = new Set();
            var allPosts = [];
            for(let i=0; i<follow.length; i++) {
                followees.add(follow[i].followeeId);
                var posts = await Post.find({userId: follow[i].followeeId}).populate('userId').populate('comments')
                                .sort('createdAt DESC').limit(limit).skip(skip);
                allPosts.push(...posts);
            }

            // get some other random posts
            var posts = await Post.find({}).populate('userId').populate('comments').sort('createdAt DESC').limit(limit).skip(skip);
            for(let i=0; i<limit; i++) {
                if(posts[i]) {
                    if(!followees.has(posts[i].userId.id)) {
                        allPosts.push(posts[i]);
                    }
                }
                else 
                    break;
            }

            let isStared = await Star.find({userId: req.user.id})
            let Starset = new Set();
            let postSet = new Set();

            for(let i = 0; i < isStared.length; i++){
                Starset.add(isStared[i].postId)
            }

            for(let i = 0; i < allPosts.length; i++){
                postSet.add(allPosts[i].id)
            }

            let staredPostsSet = Array.from(new Set([...postSet].filter(x => Starset.has(x))));

            return res.json({ posts: allPosts, stared : staredPostsSet});
        }
        catch(e) {
          return res.serverError(e);
        }
    },

    getPosts: async function(req, res) {
        try{
            let limit = req.query.limit?req.query.limit:10
            let skip = req.query.skip?req.query.skip:0
            let userId = req.query.profileId?req.query.profileId:req.user.id

            let posts = await Post.find({userId: userId}).populate('userId').populate('comments').sort('createdAt DESC').limit(limit).skip(skip)
            
            let isStared = await Star.find({userId: userId})
            let Starset = new Set();
            let postSet = new Set();

            for(let i = 0; i < isStared.length; i++) {
                Starset.add(isStared[i].postId)
            }

            for(let i = 0; i < posts.length; i++) {
                postSet.add(posts[i].id)
            }

            let staredPostsSet = Array.from(new Set([...postSet].filter(x => Starset.has(x))));

            return res.json({ posts: posts, stared : staredPostsSet});
        }
        catch(e){
            return res.serverError(e);
        }
    },

    getPost: async function(req, res) {
        try {
            let posts = await Post.find({id: req.query.postId}).populate('userId').populate('comments');
            
            let isStared = await Star.find({userId: req.user.id});
            let Starset = new Set();
            let postSet = new Set();

            for(let i=0; i<isStared.length; i++) {
                Starset.add(isStared[i].postId);
            }

            for(let i=0; i<posts.length; i++) {
                postSet.add(posts[i].id);
            }

            let staredPostsSet = Array.from(new Set([...postSet].filter(x => Starset.has(x))));

            return res.json({ post: posts[0], stared: staredPostsSet});
        }
        catch(e) {
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
        try {
            let description = req.body.description
            let images = req.body.images
    
            let post = await Post.create({description: description, images: images, userId: req.user.id}).fetch()
            console.log(post);
            return res.json({ post: post });    
        }
        catch(e) {
            return res.serverError(e);
        }
    },

    delete: async function(req, res) {
        try {
            let postId = req.body.postId;
            await Post.destroy({ id: postId });
            
            return res.json({ success: true });    
        }
        catch(e) {
            return res.serverError(e);
        }
    },

    edit: async function(req, res) {
        let post = req.body;
        Post.updateOne({id: post.id}).set({description: post.description, images: post.images}).exec(function (error, record) {
            if(error) {
                sails.log.error(error)
                return res.serverError(error)
            }
            console.log(record);
            return res.ok(record)
        });
    },
    
    star: async function(req, res) {
        try{
            let star = req.body.star
            let postId = req.body.postId

            if(star) {
                await Star.create({postId: postId, userId: req.user.id});
                await Post.update({id: postId}).set({stars: req.body.stars+1});

                let post = await Post.findOne({ id: postId });
                if(post.userId != req.user.id) {
                    let user = await User.findOne({ id: req.user.id });
                    let description = user.name + " starred your post";
                    await Notification.create({ postOwnerId: post.userId, userId: req.user.id, postId: postId, 
                                                image: user.avatar, description: description });
                }
            }
            else {
                await Star.destroy({postId: postId, userId: req.user.id})
                await Post.update({id: postId}).set({stars: req.body.stars-1})
            }

            return res.ok({ success: true });
        }
        catch(error) {
            return res.serverError(error);
        }

    },

    comment: async function(req, res) {
        try{
            let comment = req.body.comment;
            let postId = req.body.postId;
            let rec = await Comment.create({ postId: postId, userId: req.user.id, text: comment }).fetch();

            let post = await Post.findOne({ id: postId });
            if(post.userId != req.user.id) {
                let user = await User.findOne({ id: req.user.id });
                let description = user.name + " commented on your post";
                await Notification.create({ postOwnerId: post.userId, userId: req.user.id, postId: postId, 
                                            image: user.avatar, description: description });
            }
            
            return res.ok({ comment: rec });
        }
        catch(error) {
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

    },

    StarsPost : async function(req, res) {
        try{
            let isStared = await Star.find({userId: req.userId})
            return res.json({ stars: isStared});

        }
        catch(e) {
            return res.serverError(e);
        }
    }
  
  };

  