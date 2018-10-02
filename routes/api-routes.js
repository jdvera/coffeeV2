// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
var firebase = require("../config/firebase");
var Sequelize = require('sequelize');

module.exports = function (app) {
    var Op = Sequelize.Op;

    app.post("/api/login", passport.authenticate("local"), function (req, res) {
        console.log(" --------------- cb for POST /api/login--------------- ");

        if (req.body.isJoining) {
            console.log(" --------------- user joining existing group --------------- ");
            db.UserGroups.findOne({
                where: {
                    groupNum: req.body.groupNum,
                    userId: req.user.id
                }
            }).then(function(dbResponse){
                if(dbResponse) {
                    console.log(" --------------- Login, user already logged into this group --------------- ");
                    res.status(409).json({ response: { status: 409 } });
                }
                else {
                    createUserGroup(req, res);
                }
            }).catch(function(err){
                console.log(" --------------- db.UserGroups login Joining error --------------- ");
                console.log(err);
                res.json(err);
            })
        }
        else {
            console.log(" --------------- creating brand new group ---------------  ");
            req.body.groupNum = (Math.random() + " ").substring(2, 10) + (Math.random() + " ").substring(2, 10);

            db.Groups.create({ groupNum: req.body.groupNum }).then(function () {
                console.log(" --- new group created, now usergroup --- ");
                createUserGroup(req, res);
            }).catch(function (err) {
                console.log(" --------------- db.Groups error --------------- ");
                console.log(err);
                res.json(err);
            });
        }
    });

    var createUserGroup = function (req, res) {
        db.UserGroups.create({ userId: req.user.id, groupNum: req.body.groupNum, isCreator: !req.body.isJoining }).then(function (dbUserGroups) {
            console.log(" --------------- Created UserGroup Successfully --------------- ");
            res.json({
                userGroupId: dbUserGroups.id,
                userId: dbUserGroups.userId,
                groupNum: dbUserGroups.groupNum,
                isCreator: dbUserGroups.isCreator
            });
            firebase.database().ref('group/' + req.body.groupNum + '/online').push(req.user.username);
        }).catch(function (err) {
            console.log(" --------------- db.UserGroups Create error --------------- ");
            console.log(err);
            res.json(err);
        });
    }

    app.post("/api/signup", function (req, res) {
        console.log(" --------------- signup --------------- ");
        console.log(JSON.stringify(req.body, null, 3));
        db.Users.create({
            username: req.body.username,
            password: req.body.password
        }).then(function () {
            console.log(" --------------- signup successful, redirecting --------------- ");
            res.redirect(307, "/api/login");
        }).catch(function (err) {
            console.log(" --------------- Error Message Below --------------- ");
            console.log(err.errors[0].message);
            res.status(422).json(err.errors[0].message);
        });
    });

    app.put("/api/updateLocation", function (req, res) {
        db.UserGroups.update({
            lat: req.body.currentLocation.lat,
            lng: req.body.currentLocation.lng
        }, {
                where: { id: req.body.userGroupId }
            }).then(function () {
                res.json({ success: true });
                calcCenter(req.body.groupNum);
            }).catch(function (UpdateErr) {
                console.log(" --------------- db.UserGroups Update error --------------- ");
                console.log(UpdateErr);
                res.json(UpdateErr);
            });
    });

    var calcCenter = function(groupNum) {
        db.UserGroups.findAll({
            where: {
                groupNum: groupNum
            }
        }).then(function (dbUserGroupsFindAll) {
            console.log(" --------------- dbUserGroupsFindAll --------------- ");
            console.log(JSON.stringify(dbUserGroupsFindAll, null, 3));
            if (dbUserGroupsFindAll.length < 1) {
                console.log(" --------------- Group " + groupNum + " is empty - deleting it");
                db.Groups.destroy({ where: { groupNum: groupNum } }).then(function() {
                    console.log(" --------------- Deleted group " + groupNum + " --------------- ");
                });
                return;
            }
            var latArr = [];
            var lngArr = [];

            for (var i = 0; i < dbUserGroupsFindAll.length; i++) {
                if(dbUserGroupsFindAll[i].lat !== null) {
                    latArr.push(dbUserGroupsFindAll[i].lat);
                    lngArr.push(dbUserGroupsFindAll[i].lng);
                }
            }

            if (latArr.length > 0) {
                var latMax = latArr.reduce(function (a, b) {
                    return Math.max(a, b);
                });
                var latMin = latArr.reduce(function (a, b) {
                    return Math.min(a, b);
                });
                var lngMax = lngArr.reduce(function (a, b) {
                    return Math.max(a, b);
                });
                var lngMin = lngArr.reduce(function (a, b) {
                    return Math.min(a, b);
                });
    
    
                var updateObj = {
                    latAvg: (latMax + latMin) / 2,
                    lngAvg: (lngMax + lngMin) / 2
                }
    
                db.Groups.update(updateObj, {
                    where: { groupNum: groupNum }
                }).then(function () {
                    console.log(" --------------- Updating Firebase --------------- ")
                    firebase.database().ref('group/' + groupNum + '/center').set(updateObj);
                }).catch(function (groupsUpdateErr) {
                    console.log(" --------------- db.Groups Update error --------------- ");
                    console.log(groupsUpdateErr);
                });
            }
            else {console.log(" --------------- CalcCenter No one online has submitted a location --------------- ")}

        }).catch(function (findAllErr) {
            console.log(" --------------- db.UserGroups Find All error --------------- ");
            console.log(findAllErr);
        });
    };


    // Route for logging user out
    app.get("/logout/:groupNum/:firebaseKey/:userId", function (req, res) {
        req.logout();

        firebase.database()
            .ref('group/' + req.params.groupNum + '/online')
            .child(req.params.firebaseKey)
            .remove(function(){
                console.log(" --------------- Firebase - removed user, checking if any others are online --------------- ");
                firebase.database()
                .ref('group/' + req.params.groupNum + '/online')
                .once("value").then(function(snapshot) {
                    console.log(typeof snapshot.val());
                    console.log(snapshot.val());
                    if(snapshot.val() === null) {
                        console.log(" --------------- Group empty, deleting it --------------- ");
                        firebase.database()
                        .ref('group/' + req.params.groupNum)
                        .remove(function(){
                            console.log(" --------------- Group " + req.params.groupNum + " deleted --------------- ");
                        });
                    }
                })
            });

        db.UserGroups.destroy({ 
            where: { groupNum: req.params.groupNum, userId: req.params.userId }
        }).then(function(){
            console.log(" --------------- UserGroups - deleted user " + req.params.userId + " from group " + req.params.groupNum + " --------------- ");
            calcCenter(req.params.groupNum);
            res.send(true);
        }).catch(function(err){
            console.log(" --------------- db.UserGroups logout error --------------- ");
            res.json(err);
        });
    });
};

