'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expired extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Expired.belongsTo(models.Post, { foreignKey: 'pid', targetKey: 'id', as: 'requestPost' })
      Expired.belongsTo(models.User, { foreignKey: 'uid', targetKey: 'id', as: 'requestUser' })
    }
  }
  Expired.init({
    pid: DataTypes.STRING,
    uid: DataTypes.STRING,
    price: DataTypes.INTEGER,
    days: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM,
      values: ['Pending', 'Accepted', 'Cancelled']
    }
  }, {
    sequelize,
    modelName: 'Expired',
  });
  return Expired;
};