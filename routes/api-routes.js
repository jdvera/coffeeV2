// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
var firebase = require("../config/firebase");
var Sequelize = require('sequelize');
var google = require('@google/maps').createClient({
   key: 'AIzaSyA4SIVKpOq6bhYAs-iWZxpSZmWkv2FpcTc'
});

module.exports = function (app) {
   var Op = Sequelize.Op;

   app.get("/api/checkGroup/:groupNum", function (req, res) {
      console.log(" --------------- db.Groups checking group exists --------------- ");
      db.Groups.findOne({ where: { groupNum: req.params.groupNum } }).then(function (dbResponse) {
         res.json(dbResponse);
      }).catch(function (err) {
         console.log(" --------------- db.Groups check error --------------- ");
         console.log(err);
         res.json(err);
      })
   })

   app.post("/api/login", passport.authenticate("local"), function (req, res) {
      console.log(" --------------- cb for POST /api/login--------------- ");

      if (req.body.isJoining) {
         console.log(" --------------- user joining existing group --------------- ");
         db.Groups.findOne({ where: { groupNum: req.body.groupNum } }).then(function (groupResponse) {
            if (groupResponse) {
               db.UserGroups.findOne({
                  where: {
                     groupNum: req.body.groupNum,
                     userId: req.user.id
                  }
               }).then(function (userGroupsResponse) {
                  if (userGroupsResponse) {
                     console.log(" --------------- Login, user already logged into this group --------------- ");
                     res.status(409).json({ response: { status: 409 } });
                  }
                  else {
                     createUserGroup(req, res);
                  }
               }).catch(function (err) {
                  console.log(" --------------- db.UserGroups login Joining error --------------- ");
                  console.log(err);
                  res.json(err);
               });
            }
         }).catch(function (err) {
            console.log(" --------------- db.Groups login Joining error --------------- ");
            console.log(err);
            res.json(err);
         });
      }
      else {
         console.log(" --------------- creating brand new group ---------------  ");
         req.body.groupNum = (Math.random() + " ").substring(2, 10) + (Math.random() + " ").substring(2, 10);

         db.Groups.create({ groupNum: req.body.groupNum }).then(function () {
            console.log(" --------------- new group created, now usergroup --------------- ");
            createUserGroup(req, res);
         }).catch(function (err) {
            console.log(" --------------- db.Groups error --------------- ");
            console.log(err);
            res.json(err);
         });
      }
   });

   app.post("/api/signup", function (req, res) {
      console.log(" --------------- signup --------------- ");
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
      },
         {
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
   
   app.get("/logout/:groupNum/:firebaseKey/:userId", function (req, res) {
      req.logout();
      var thisGroup = firebase.database().ref('group/' + req.params.groupNum);
      var onlinePeeps = firebase.database().ref('group/' + req.params.groupNum + '/online');

      onlinePeeps.child(req.params.firebaseKey).remove(function () {
         console.log(" --------------- Firebase - removed user, checking if any others are online --------------- ");
         onlinePeeps.once("value").then(function (snapshot) {
            if (snapshot.val() === null) {
               console.log(" --------------- Group empty, deleting it --------------- ");
               thisGroup.remove(function () {
                  console.log(" --------------- Group " + req.params.groupNum + " deleted --------------- ");
               });
            }
         });
      });

      db.UserGroups.destroy({
         where: { groupNum: req.params.groupNum, userId: req.params.userId }
      }).then(function () {
         console.log(" --------------- UserGroups - deleted user " + req.params.userId + " from group " + req.params.groupNum + " --------------- ");
         calcCenter(req.params.groupNum);
         res.send(true);
      }).catch(function (err) {
         console.log(" --------------- db.UserGroups logout error --------------- ");
         res.json(err);
      });
   });



   //  --------------------------------------------
   //  --  END OF ROUTES, NAMED FUNCTIONS BELOW  --
   //  --------------------------------------------

   

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
   };
   
   var calcCenter = function (groupNum) {
      console.log(" --------------- calcCenter --------------- ");
      db.UserGroups.findAll({
         where: {
            groupNum: groupNum
         }
      }).then(function (dbUserGroupsFindAll) {
         console.log(" --------------- dbUserGroupsFindAll --------------- ");
         if (dbUserGroupsFindAll.length < 1) {
            console.log(" --------------- Group " + groupNum + " is empty - deleting it");
            db.Groups.destroy({ where: { groupNum: groupNum } }).then(function () {
               console.log(" --------------- Deleted group " + groupNum + " --------------- ");
            }).catch(function(err) {
               console.log(" --------------- dbUserGroupsFindAll --------------- ");
               console.log(err);
            });
            return;
         }
         var latArr = [];
         var lngArr = [];

         for (var i = 0; i < dbUserGroupsFindAll.length; i++) {
            if (dbUserGroupsFindAll[i].lat !== null) {
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

            var avgLatLng = {
               lat: (latMax + latMin) / 2,
               lng: (lngMax + lngMin) / 2
            };

            db.Groups.update(avgLatLng, {
               where: { groupNum: groupNum }
            }).then(function () {
               googlePlaces(avgLatLng, groupNum);
            }).catch(function (groupsUpdateErr) {
               console.log(" --------------- db.Groups Update error --------------- ");
               console.log(groupsUpdateErr);
            });
         }
         else {
            console.log(" --------------- CalcCenter No one online has submitted a location --------------- ");
         }
      }).catch(function (findAllErr) {
         console.log(" --------------- db.UserGroups Find All error --------------- ");
         console.log(findAllErr);
      });
   };

   var googlePlaces = function(avgLatLng, groupNum) {
      console.log(" --------------- Google finding places --------------- ");

      var letteredResults = [];
      var request = {
         location: avgLatLng,
         radius: 500,
         type: 'cafe'
      };

      google.placesNearby(request, function (err, googleResults) {
         if (err || googleResults.json.status !== "OK") {
            console.log(" --------------- Google err --------------- ");
            console.log(err);
            console.log(googleResults.json.status);
         }
         else {
            console.log(" --------------- Google found " + googleResults.json.results.length + " places --------------- ");
            var labels = 'ABCDEFGHIJKLMNOPQRST';
            var labelIndex = 0;
            var haveLats = [];
            var haveLngs = [];

            letteredResults = googleResults.json.results.map(function (place) {
               if (haveLats.includes(place.geometry.location.lat) && haveLngs.includes(place.geometry.location.lng)) {
                  return null;
               }
               haveLats.push(place.geometry.location.lat);
               haveLngs.push(place.geometry.location.lng);

               place.letter = labels[labelIndex];
               labelIndex++;
               return place;
            }).filter(function (place) {
               return place;
            });
         }

         console.log(" --------------- Updating Firebase --------------- ");
         var updateObj = {
            avgLatLng: avgLatLng,
            googleResults: letteredResults,
            timestamp: Date.now()
         };
         firebase.database().ref('group/' + groupNum + '/center').set(updateObj, function (err) {
            if (err) {
               console.log(err);
            }
            else {
               console.log(" --------------- Firebase updated successfully --------------- ");
            }
         });
      });
   };
};
