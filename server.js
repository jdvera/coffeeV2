require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("./config/passport");
const firebase = require("./config/firebase");
const path = require("path");

const PORT = process.env.PORT || 3010;
const db = require("./models");

// Creating express app and configuring middleware needed for authentication
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static("public"));
// We need to use sessions to keep track of our user's login status
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
else {
  app.use(express.static("client/public"));
}

// Requiring our routes
require("./routes/api-routes.js")(app);

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
  });
}

// Syncing our database and logging a message to the user upon success
db.sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () => {
    db.Users.create({ username: "asdf", password: "asdf" }).then(() => {
      console.log("test user 'asdf' created");
      var fbdb = firebase.database();
      fbdb.ref("group").once("value").then((snapshot) => {
        console.log(" ----------- checking for groups ----------- ");
        for (var key in snapshot.val()) {
          console.log(` -------- deleting ${key} -------- `);
          fbdb.ref("group/" + key).remove();
        }
        console.log("");
        console.log(" ------------------------------------------- ");
        console.log(" ---------- END OF SERVER STARTUP ---------- ");
        console.log(" ------------------------------------------- ");
      });
    });
  });
});
