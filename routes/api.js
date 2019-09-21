const express = require('express');
const router = express.Router();
const passport = require('passport');
const USER = require('../models/user');
const ARTICLE = require('../models/article');
const COMMENT = require('../models/comment');
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage });

///////////////////////////////////////////////
//////////////// ADD ADMIN ///////////////////
/////////////////////////////////////////////
router.post('/veisi/add_admin', (req, res) => {
    USER.findOne({ role: 'admin' }, (err, admin) => {
        if (admin) {
            res.sendStatus(403);
        } else {
            let newUser = new USER({
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                username: req.body.username,
                phone: req.body.phone,
                password: req.body.password,
                gender: req.body.gender_rd,
                role: req.body.role
            });
            newUser.save((err) => {
                if (err) {
                    console.log('Somthing went wrong: ', err);
                    return;
                } else {
                    res.send('ADMIN DONE!');
                }
            });
        }
    });
});

router.get('/admin/dashboard', isAdmin, (req, res) => {
    USER.find({ role: 'user' }, (err, users) => {
        if (err) throw err;
        ARTICLE.find({ author: 'deleted' }, (err, deletedUsersArticles) => {
            if (err) throw err;
            req.flash('success', 'Welcome Admin ' + req.user.username + ' :)');
            res.render('admin-dashboard', { users, deletedUsersArticles })
        });
    });
});

router.get('/admin/user/:id', isAdmin, (req, res) => {
    USER.findOne({ _id: req.params.id }, (err, user) => {
        if (err) throw err;
        res.render('admin-user', { user });
    });
});

router.post('/admin/user/edit/:id', isAdmin, upload.single('profile'), (req, res) => {
    let updatedUser = {};
    updatedUser.firstName = req.body.first_name;
    updatedUser.lastName = req.body.last_name;
    updatedUser.password = req.body.password;
    updatedUser.username = req.body.username;
    updatedUser.profilePic = req.file.filename || null;
    updatedUser.phone = req.body.phone;
    updatedUser.gender = req.body.gender_rd;

    USER.updateOne({ _id: req.params.id }, updatedUser, (err) => {
        if (err) throw err;
        req.flash('success', 'User Updated Successfuly :)')
        res.redirect('/api/admin/dashboard');
    });
});

router.get('/admin/user/delete/:id', isAdmin, (req, res) => {
    let updatedArt = {};
    updatedArt.author = 'deleted';
    USER.deleteOne({ _id: req.params.id }, (err) => {
        if (err) throw err;
        ARTICLE.updateOne({ author: req.params.id }, updatedArt, (err) => {
            if (err) throw err;
            req.flash('success', 'User Deleted Successfuly!');
            res.redirect('/api/admin/dashboard');
        });
    });
});

router.get('/admin/user/articles/:id', isAdmin, (req, res) => {
    ARTICLE.find({ author: req.params.id }, (err, articles) => {
        if (err) throw err;
        res.render('admin-user-articles', { articles });
    });
});

router.get('/admin/user/article/edit/:id', isAdmin, (req, res) => {
    ARTICLE.findOne({ _id: req.params.id }, (err, article) => {
        if (err) throw err;
        res.render('admin-user-article-edit', { article });
    });
});

router.post('/admin/user/article/edit/:id', isAdmin, upload.single('picture'), (req, res) => {
    updateArtice = {};
    updateArtice.title = req.body.title;
    updateArtice.content = req.body.content;
    updateArtice.picture = req.file.filename

    ARTICLE.updateOne({ _id: req.params.id }, updateArtice, (err) => {
        if (err) throw err;
        ARTICLE.findOne({ _id: req.params.id }, (err, article) => {
            if (err) throw err;
            req.flash('success', 'Article Updated successfully! :)');
            res.redirect('/api/admin/user/articles/' + article.author);
        });
    });
});

router.get('/admin/user/article/delete/:id', isAdmin, (req, res) => {
    ARTICLE.findOneAndRemove({ _id: req.params.id }, (err, article) => {
        if (err) throw err;
        req.flash('Article Deleted!');
        res.redirect('/api/admin/user/articles/' + article.author);
    });
});

router.get('/admin/deleteduser/article/edit/:id', isAdmin, (req, res) => {
    ARTICLE.findOne({ _id: req.params.id }, (err, deletedUserArticle) => {
        if (err) throw err;
        res.render('admin-deleteduser-article-edit', { deletedUserArticle });
    });
});

router.post('/admin/deleteduser/article/edit/:id', isAdmin, upload.single('picture'), (req, res) => {
    updateArtice = {};
    updateArtice.title = req.body.title;
    updateArtice.content = req.body.content;
    updateArtice.picture = req.file.filename

    ARTICLE.updateOne({ _id: req.params.id }, updateArtice, (err) => {
        if (err) throw err;
        req.flash('success', 'Article Updated successfully! :)');
        res.redirect('/api/admin/dashboard');
    });
});

router.get('/admin/deleteduser/article/delete/:id', isAdmin, (req, res) => {
    ARTICLE.findOneAndRemove({ _id: req.params.id }, (err, article) => {
        if (err) throw err;
        req.flash('Article Deleted!');
        res.redirect('/api/admin/dashboard');
    });
});

router.post('/comment/add', isUser, (req, res) => {
    let _comment = new COMMENT({
        content: req.body.content,
        author: req.user._id,
        article: req.body.article_id
    });

    _comment.save((err) => {
        if (err) {
            req.flash('danger', 'Something went wrong. try again!');
            return res.render('signup');
        } else {
            req.flash('success', 'comment added :)');
            res.redirect('/api/article/show/' + req.body.article_id);
        }
    });
});

router.post('/comment/edit/:id', isUser, (req, res) => {
    let updatedComment = {};
    updatedComment.content = req.body.content;
    COMMENT.findOneAndUpdate({ _id: req.params.id }, updatedComment, (err, comment) => {
        if (err) throw err;
        req.flash('success', 'comment updated');
        res.redirect('/api/article/show/' + comment.article);
    });
});

router.get('/comment/delete/:id', isUser, (req, res) => {
    COMMENT.findOneAndRemove({ _id: req.params.id }, (err, comment) => {
        if (err) throw err;
        req.flash('success', 'comment deleted!');
        res.redirect('/api/article/show/' + comment.article);
    });
});

////////////////////////////////////////////
///////////////////////////////////////////
//////////////////////////////////////////

/////////////////////////////////////////
////////// USERS REQUESTS ///////////////

// [ GET ] to Sign in
router.get('/signin', isNotAny, (req, res) => {
    res.render('signin');
});

// [ POST ] to Sign in
router.post('/signin', isNotAny, (req, res, next) => {
    req.checkBody('username', 'Enter you Email!').notEmpty();
    req.checkBody('password', 'Enter you Password!').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.render('signin', {
            errors: errors
        });
    } else {
        USER.findOne({ username: req.body.username }, (err, user) => {
            if (err) throw err;
            if (!user) { req.flash('danger', 'user not found'); res.redirect('/api/signin'); }
            if (user) {
                if (user.role == 'user') {
                    passport.authenticate('local', (err, user, info) => {
                        if (err) { return next(err); }
                        if (!user) { req.flash('danger', 'Wrong Password!'); res.redirect('/api/signin'); }
                        req.logIn(user, function (err) {
                            if (err) { return next(err); }
                            return res.redirect('/api/user/dashboard');
                        });
                    })(req, res, next);
                } else if (user.role == 'admin') {
                    passport.authenticate('local', (err, user, info) => {
                        if (err) { return next(err); }
                        if (!user) { req.flash('danger', 'Wrong Password!'); res.redirect('/api/sign'); }
                        req.logIn(user, function (err) {
                            if (err) { return next(err); }
                            return res.redirect('/api/admin/dashboard');
                        });
                    })(req, res, next);
                } else {
                    res.redirect('')
                }
            }
        });
    }
});

// [ GET ] to Sign up
router.get('/signup', isNotAny, (req, res) => {
    res.render('signup');
});

// [ POST ] to Sign up
router.post('/signup', isNotAny, (req, res) => {
    req.checkBody('first_name', 'First Name is required!').notEmpty();
    req.checkBody('last_name', 'Last Name is required!').notEmpty();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('phone', 'Phone is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    let errors = req.validationErrors();

    if (errors) {
        res.render('signup', { errors: errors });
    } else {
        let newUser = new USER({
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            username: req.body.username,
            phone: req.body.phone,
            password: req.body.password,
            gender: req.body.gender_rd,
        });
        newUser.save((err) => {
            if (err) {
                req.flash('danger', 'Something went wrong. try again!');
                return res.render('signup');
            } else {
                req.flash('success', 'Your registration is complete! now you can sign in :)');
                res.redirect('/api/signin');
            }
        });
    }
});

// [ GET ] to signout
router.get('/signout', (req, res) => {
    req.logout();
    req.flash('success', 'You are Out!');
    res.redirect('/api/signin');
});

// [ GET ] to user dashboard
router.get('/user/dashboard', isUser, (req, res) => {
    ARTICLE.find({ author: { $ne: req.user._id } }, (err, otherUsersArticles) => {
        if (err) throw err;
        ARTICLE.find({ author: req.user._id }, (err, thisUserArticles) => {
            if (err) throw err;
            USER.findOne({ _id: req.user._id }, (err, thisUser) => {
                if (err) throw err;
                COMMENT.find({ author: thisUser._id }, (err, thisUserComments) => {
                    if (err) throw err;
                    ARTICLE.find({ }, (err, allArticles) => {
                        if (err) throw err;
                        console.log(thisUserComments)
                        console.log(allArticles)
                        thisUserArticles = Object.assign([], thisUserArticles).reverse();
                        otherUsersArticles = Object.assign([], otherUsersArticles).reverse();
                        thisUserComments = Object.assign([], thisUserComments).reverse();
                        res.render('user-dashboard', { thisUserArticles, otherUsersArticles, thisUser, thisUserComments, allArticles });
                    })
                });
            });
        });
    });
});

// [ POST ] to edit user
router.post('/user/edit/:id', isUser, upload.single('profile'), (req, res) => {
    let updateUser = {};
    updateUser.firstName = req.body.first_name;
    updateUser.lastName = req.body.last_name;
    updateUser.phone = req.body.phone;
    updateUser.password = req.body.password;
    updateUser.gender = req.body.gender;
    updateUser.username = req.body.username;
    updateUser.profilePic = req.file.filename || null;
    USER.updateOne({ _id: req.params.id }, updateUser, (err) => {
        if (err) throw err;
        req.flash('success', 'Your information has been updated successfuly :)');
        res.redirect('/api/user/dashboard');
    });

});

////////////////////////////////////////////
///////////////////////////////////////////
//////////////////////////////////////////

/////////////////////////////////////////
////////// ARTICLES REQUESTS ///////////////

// [ GET ] to single article
router.get('/article/show/:id', (req, res) => {
    ARTICLE.findById({ _id: req.params.id }, (err, article) => {
        if (err) throw err;
        if (article.author != 'deleted') {
            USER.findById({ _id: article.author }, (err, currentUser) => {
                if (err) throw err;
                COMMENT.find({ article: article._id }, (err, comments) => {
                    if (err) throw err;
                    if (comments == '') return res.render('article', { article, currentUser });
                    if (comments) {
                        USER.findOne({ _id: comments[0].author }, (err, commentUser) => {
                            if (err) throw err;
                            return res.render('article', { article, currentUser, comments, commentUser });
                        });
                    }
                });
            });
        }
    });
});

// [ GET ] to add article
router.get('/article/add', isUser, (req, res) => {
    res.render('add_article');
});

// [ POST ] to add article
router.post('/article/add', isUser, upload.single('picture'), (req, res) => {
    req.validate('title', 'Please Enter Title').notEmpty();
    req.validate('content', 'Please Enter Content').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        res.render('add_article', { errors });
    } else {
        let newArticle = new ARTICLE({
            title: req.body.title,
            content: req.body.content,
            picture: req.file.filename,
            author: req.user._id
        });

        newArticle.save((err) => {
            if (err) {
                req.flash('danger', 'Something went wrong and article does not saved!');
                res.render('add_article');
            } else {
                req.flash('success', 'Article Added Successfuly :)');
                res.redirect('/api/user/dashboard');
            }
        });
    }
});

// [ GET ] to edit article
router.get('/article/edit/:id', isUser, (req, res) => {
    ARTICLE.findById({ _id: req.params.id }, (err, article) => {
        USER.findById({ _id: article.author }, (err, user) => {
            if (req.user.id == user._id) {
                if (err) throw err;
                res.render('edit_article', { article })
            } else {
                req.flash('danger', 'You cant edit other users articles');
                res.redirect('/api/user/dashboard');
            }
        });
    });
});
// [ POST ] to edit article
router.post('/article/edit/:id', isUser, upload.single('picture'), (req, res) => {
    let newArticle = {};
    newArticle.title = req.body.title;
    newArticle.content = req.body.content;
    newArticle.picture = req.file.filename || null;

    ARTICLE.updateOne({ _id: req.params.id }, newArticle, (err, article) => {
        if (err) throw err;
        req.flash('success', 'Article Updated! :)');
        res.redirect('/api/user/dashboard');
    })
});

// [ GET ] to delete article
router.get('/article/delete/:id', isUser, (req, res) => {
    ARTICLE.findById({ _id: req.params.id }, (err, article) => {
        if (err) throw err;
        USER.findById({ _id: article.author }, (err, user) => {
            if (err) throw err;
            if (req.user.id != user._id) {

                req.flash('danger', 'You Cant delete other users articles');
                res.redirect('/api/user/dashboard');
            } else {
                ARTICLE.findByIdAndRemove({ _id: req.params.id }, (err) => {
                    if (err) throw err;
                    req.flash('success', 'Article Deleted! :)');
                    res.redirect('/api/user/dashboard');
                });
            }
        });
    });
});

// Authenticate and Authorization Functionallities
function isUser(req, res, next) {
    if (req.isAuthenticated() && req.user.role == 'user') {
        next();
    } else {
        req.flash('danger', 'you have not access to this page, please login first!');
        res.redirect('/api/signin');
    }
}


function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role == 'admin') {
        next();
    } else {
        req.flash('danger', 'you have not access to this page, please login first!');
        res.redirect('/api/signin');
    }
}

function isNotAny(req, res, next) {
    if (!req.user) {
        next();
    } else {
        let url;
        if (req.user.role == 'user') {
            url = '/api/user/dashboard';
        }
        if (req.user.role == 'admin') {
            url = '/api/admin/dashboard';
        }
        req.flash('danger', 'you are already logged in!');
        res.redirect(url);

    }
}


module.exports = router;