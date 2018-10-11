// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
const firebase = require("../config/firebase");
const google = require('@google/maps').createClient({
    key: process.env.MAPS_KEY
});

module.exports = app => {
    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        console.log(" --------------- cb for POST /api/login--------------- ");

        if (req.body.isJoining) {
            console.log(" --------------- user joining existing group --------------- ");
            firebase.database().ref(`group/${req.body.groupNum}`).once("value").then(snapshot => {
                console.log("snapshot:", snapshot.val());
                if (snapshot.val()) {
                    db.UserGroups.findOne({
                        where: {
                            groupNum: req.body.groupNum,
                            userId: req.user.id
                        }
                    }).then(userGroupsResponse => {
                        if (userGroupsResponse) {
                            console.log(" --------------- /api/login, user already logged into this group --------------- ");
                            res.status(409).json({ response: { status: 409 } });
                        }
                        else {
                            createUserGroup(req, res);
                        }
                    }).catch(err => {
                        console.log(" --------------- db.UserGroups login Joining error --------------- ");
                        console.log(err);
                        res.json(err);
                    });
                }
            });
        }
        else {
            console.log(" --------------- creating brand new group ---------------  ");
            req.body.groupNum = (Math.random() + " ").substring(2, 10) + (Math.random() + " ").substring(2, 10);
            createUserGroup(req, res);
        }
    });

    app.post("/api/signup", (req, res) => {
        console.log(" --------------- /api/signup --------------- ");
        db.Users.create({
            username: req.body.username,
            password: req.body.password
        }).then(() => {
            console.log(" --------------- /api/signup successful, redirecting --------------- ");
            res.redirect(307, "/api/login");
        }).catch(err => {
            console.log(" --------------- /api/signup failed --------------- ");
            console.log(err.errors[0].message);
            res.status(422).json(err.errors[0].message);
        });
    });

    app.put("/api/updateLocation", (req, res) => {
        db.UserGroups.update(
            req.body.currentLocation,
            { where: { id: req.body.userGroupId } }
        ).then(() => {
            res.json({ success: true });
            calcCenter(req.body.groupNum);
        }).catch(updateErr => {
            console.log(" --------------- db.UserGroups Update error --------------- ");
            console.log(updateErr);
            res.json(updateErr);
        });
    });

    app.post("/api/vote", (req, res) => {
        console.log(" --------------- /api/vote --------------- ");
        const { groupNum, firebaseKey, placeId } = req.body;
        const thisUser = firebase.database().ref(`group/${groupNum}/online/${firebaseKey}`);

        thisUser.once("value").then(snapshot => {
            if (snapshot.val()) {
                const newObj = snapshot.val();
                newObj.vote = placeId;
                console.log(" --------------- updated user info", newObj);
                thisUser.set(newObj);
            }
            else {
                console.log(" --------------- /api/vote Something went wrong --------------- ");
            }
        });
        res.send(true);
    });

    app.get("/logout/:groupNum/:firebaseKey/:userId/:votedFor", (req, res) => {
        req.logout();
        const thisGroup = firebase.database().ref(`group/${req.params.groupNum}`);
        const onlinePeeps = firebase.database().ref(`group/${req.params.groupNum}/online`);

        db.UserGroups.destroy({
            where: { groupNum: req.params.groupNum, userId: req.params.userId }
        }).then(() => {
            console.log(` --------------- UserGroups - deleted user ${req.params.userId} from group ${req.params.groupNum} --------------- `);
            onlinePeeps.child(req.params.firebaseKey).remove(() => {
                console.log(" --------------- Firebase - removed user, checking if any others are online --------------- ");
                res.send(true);
                onlinePeeps.once("value").then(snapshot => {
                    if (snapshot.val()) {
                        console.log(" --------------- Firebase - others online, recalulating center --------------- ");
                        calcCenter(req.params.groupNum);
                    }
                    else {
                        console.log(" --------------- Firebase - Group empty, deleting it --------------- ");
                        thisGroup.remove(() => {
                            console.log(` --------------- Firebase - Group ${req.params.groupNum} deleted --------------- `);
                        });
                    }
                });
            });
        }).catch(err => {
            console.log(" --------------- db.UserGroups logout error --------------- ");
            res.json(err);
        });
    });



    //  --------------------------------------------
    //  --  END OF ROUTES, NAMED FUNCTIONS BELOW  --
    //  --------------------------------------------



    const createUserGroup = (req, res) => {
        db.UserGroups.create({ userId: req.user.id, groupNum: req.body.groupNum }).then(dbUserGroups => {
            console.log(" --------------- Created UserGroup Successfully --------------- ");
            res.json({
                userGroupId: dbUserGroups.id,
                userId: dbUserGroups.userId,
                groupNum: dbUserGroups.groupNum
            });
            const firebaseObj = {
                name: req.user.username,
                vote: null
            }
            firebase.database().ref(`group/${req.body.groupNum}/online`).push(firebaseObj);
        }).catch(err => {
            console.log(" --------------- db.UserGroups Create error --------------- ");
            console.log(err);
            res.json(err);
        });
    };

    const calcCenter = groupNum => {
        console.log(" --------------- calcCenter --------------- ");
        db.UserGroups.findAll({
            where: {
                groupNum: groupNum
            }
        }).then(dbUserGroupsFindAll => {
            console.log(" --------------- dbUserGroupsFindAll --------------- ");
            if (dbUserGroupsFindAll.length < 1) {
                console.log(" --------------- IF YOU SEE THIS, SOMETHING WENT WRONG --------------- ");
                return;
            }
            const latArr = [];
            const lngArr = [];

            dbUserGroupsFindAll.forEach(elem => {
                if (elem.lat !== null) {
                    latArr.push(elem.lat);
                    lngArr.push(elem.lng);
                }
            })

            if (latArr.length) {
                const latMax = latArr.reduce((a, b) => Math.max(a, b));
                const latMin = latArr.reduce((a, b) => Math.min(a, b));
                const lngMax = lngArr.reduce((a, b) => Math.max(a, b));
                const lngMin = lngArr.reduce((a, b) => Math.min(a, b));

                const avgLatLng = {
                    lat: (latMax + latMin) / 2,
                    lng: (lngMax + lngMin) / 2
                };

                googlePlaces(avgLatLng, groupNum);
            }
            else {
                console.log(" --------------- CalcCenter No one online has submitted a location --------------- ");
            }
        }).catch(findAllErr => {
            console.log(" --------------- db.UserGroups Find All error --------------- ");
            console.log(findAllErr);
        });
    };

    const googlePlaces = (avgLatLng, groupNum) => {
        console.log(" --------------- Google finding places --------------- ");

        let letteredResults = [];
        const request = {
            location: avgLatLng,
            radius: 450,
            type: 'cafe'
        };

        google.placesNearby(request, (err, googleResults) => {
            if (err || googleResults.json.status !== "OK") {
                console.log(" --------------- Google err --------------- ");
                console.log(err);
                console.log(googleResults.json.status);
            }
            else {
                console.log(" --------------- Google found " + googleResults.json.results.length + " places --------------- ");
                const labels = 'ABCDEFGHIJKLMNOPQRST';
                let labelIndex = 0;
                const haveLats = [];
                const haveLngs = [];

                letteredResults = googleResults.json.results.map(place => {
                    if (haveLats.includes(place.geometry.location.lat) && haveLngs.includes(place.geometry.location.lng)) {
                        return null;
                    }
                    haveLats.push(place.geometry.location.lat);
                    haveLngs.push(place.geometry.location.lng);

                    place.letter = labels[labelIndex];
                    labelIndex++;
                    return place;
                }).filter(place => place);
            }

            console.log(" --------------- Updating Firebase Center --------------- ");
            const updateObj = {
                avgLatLng: avgLatLng,
                googleResults: letteredResults,
                timestamp: Date.now()
            };
            firebase.database().ref(`group/${groupNum}/center`).set(updateObj, err => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(" --------------- Firebase Center updated successfully --------------- ");
                    checkOldVotes(groupNum, letteredResults);
                }
            });
        });
    };

    const checkOldVotes = (groupNum, letteredResults) => {
        firebase.database().ref(`group/${groupNum}/online`).once("value").then(snapshot => {
            console.log(" --------------- Checking that voted places are still results --------------- ");
            let onlineObj = snapshot.val();
            for (let firebaseKey in onlineObj) {
                if (onlineObj[firebaseKey].vote) {
                    let foundPlace = false;
                    letteredResults.forEach(y => {
                        if (onlineObj[firebaseKey].vote === y.id) {
                            foundPlace = true;
                        }
                    });
                    if(!foundPlace){
                        onlineObj[firebaseKey].vote = null;
                    }
                }
            };
            
            firebase.database().ref(`group/${groupNum}/online`).set(onlineObj, err => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(" --------------- Firebase Votes updated successfully --------------- ");
                }
            });
        });
    };

    // const updateVotes = (body, res) => {
    //     firebase.database().ref(`group/${body.groupNum}/votes`).once("value").then(snapshot => {
    //         console.log(` --------------- Firebase votes for ${body.groupNum} --------------- `);
    //         const votesArr = snapshot.val() || [];
    //         console.log("Old votes");
    //         console.log(votesArr);
    //         let foundThisVote = false;
    //         if (snapshot.val()) {
    //             votesArr.forEach((i, index) => {
    //                 console.log("-----");
    //                 console.log(body.prevVote);
    //                 console.log(i.placeId);
    //                 if (i.placeId === body.prevVote) {
    //                     votesArr[index].val--;
    //                 }
    //                 else if (i.placeId === body.thisVote) {
    //                     foundThisVote = true;
    //                     votesArr[index].val++;
    //                 }
    //             });
    //         }
    //         if (!foundThisVote && !body.loggingOut) {
    //             votesArr.push({
    //                 placeId: body.thisVote,
    //                 val: 1
    //             });
    //         }
    //         console.log("New votes");
    //         console.log(votesArr);
    //         firebase.database().ref(`group/${body.groupNum}/votes`).set(votesArr, err => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //             else {
    //                 console.log(" --------------- Firebase updated successfully --------------- ");
    //             }
    //         });
    //         res.send(true);
    //     });
    // };
};