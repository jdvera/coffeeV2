module.exports = function(sequelize, DataTypes) {
    var UserGroups = sequelize.define("UserGroups", {
      userId: {
        type: DataTypes.TINYINT,
        allowNull: false
      },
      groupNum: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isCreator: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      lat: DataTypes.FLOAT,
      lng: DataTypes.FLOAT,
    });
    
    return UserGroups;
  };