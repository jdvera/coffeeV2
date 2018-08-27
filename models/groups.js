module.exports = function(sequelize, DataTypes) {
  var Groups = sequelize.define("Groups", {
    groupNum: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latAvg: DataTypes.FLOAT,
    lngAvg: DataTypes.FLOAT
  });
  
  return Groups;
};
