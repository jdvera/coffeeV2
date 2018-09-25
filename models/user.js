var bcrypt = require("bcrypt-nodejs");

module.exports = function (sequelize, DataTypes) {
  var Users = sequelize.define("Users", {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Users.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  Users.hook("beforeCreate", function (users) {
    users.password = bcrypt.hashSync(users.password, bcrypt.genSaltSync(10), null);
  });

  return Users;
};
