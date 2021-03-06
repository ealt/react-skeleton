// dependencies
const express = require('express');
const connect = require('connect-ensure-login');

// models
const User = require('../models/user');
const Convo = require('../models/convo');
const Comment = require('../models/comment');

const router = express.Router();

// api endpoints

// users
router.get('/whoami', function(req, res) {
    console.log(req.user)
    if(req.isAuthenticated()) {
        res.send(req.user);
    }
    else {
        res.send({});
    }
});

router.get('/user', function(req, res) {
    User.findOne({ _id: req.query._id }, function(err, user) {
        res.send(user);
    });
});

router.post(
    '/location',
    connect.ensureLoggedIn(),
    function(req, res) {    
        User.updateOne({ _id: req.user._id }, {$set: {
            latitude: req.body.latitude,
            longitude: req.body.longitude,
        }}, (err, results) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log(results);
            }
        });
        res.send();
    }
);

// convos
router.get(
    '/convo',
    function(req, res) {
        req.query._id !== undefined ?
            Convo.findOne({ _id: req.query._id }, function(err, convo) {
                res.send(convo);
            })
            :
            Convo.find({}, function(err, convos) {
                res.send(convos);
            })
        ;
    }
);

router.post(
    '/convo',
    connect.ensureLoggedIn(),
    function(req, res) {
        const newConvo = new Convo({
            'creator_id': req.user._id,
            'creator_name': req.user.name,
            'convo_name': req.body.convo_name,
            'latitude': req.body.latitude,
            'longitude': req.body.longitude,
            'radius': req.body.radius,
        });
        newConvo.save((err, convoObj) => {
            const io = req.app.get('socketio');
            io.emit('convo', convoObj); // {creator_name: req.user.name, convo_name: req.body.convo_name}
            if (err) console.log(err);
        });
        res.send();
    }
);

// comments
router.get(
    '/comment',
    function(req, res) {
        Comment.find({ convo_id: req.query.convo_id }, function(err, comments) {
            res.send(comments);
        })
    }
);

router.post(
    '/comment',
    connect.ensureLoggedIn(),
    function(req, res) {
        const newConmment = new Comment({
            'creator_id': req.user._id,
            'creator_name': req.user.name,
            'convo_id': req.body.convo_id,
            'content': req.body.content,
        });
        newConmment.save((err, commentObj) => {
            const io = req.app.get('socketio');
            io.emit('comment', commentObj); // {creator_name: req.user.name, convo_id: req.body.convo_id, content: req.body.content}
            if (err) console.log(err);
        });
        res.send();
    }
);

module.exports = router;
