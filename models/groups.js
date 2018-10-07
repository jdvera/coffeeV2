module.exports = function (sequelize, DataTypes) {
  var Groups = sequelize.define("Groups", {
    groupNum: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT
  });

  return Groups;
};
