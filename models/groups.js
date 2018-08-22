module.exports = function(sequelize, DataTypes) {
  var Groups = sequelize.define("Groups", {
    groupNum: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latAvg: DataTypes.STRING,
    lngAvg: DataTypes.STRING
  });
  
  return Groups;
};
