var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var passport = require("./config/passport");

var PORT = process.env.PORT || 3010;
var db = require("./models");

// Creating express app and configuring middleware needed for authentication
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
// We need to use sessions to keep track of our user's login status
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Requiring our routes
// require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Syncing our database and logging a message to the user upon success
db.sequelize.sync({ force: true }).then(function() {
  app.listen(PORT, function() {
    console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
    db.Users.create({ username: "asdf", password: "asdf" }).then(function(){
      console.log("test user 'asdf' created");
      db.Groups.create({ groupNum: "1234" }).then(function(){
        console.log("test group '1234' created");
        db.UserGroups.create({ userId: "1", groupNum: "1234", isCreator: true }).then(function(){
          console.log("test userGroup created");
          console.log(" ------------------------------------------- ");
          console.log(" ---------- END OF SERVER STARTUP ---------- ");
          console.log(" ------------------------------------------- ");
        });
      });
    });
  });
});