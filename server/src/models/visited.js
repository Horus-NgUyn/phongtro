'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Visited extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Visited.init({
    uid: DataTypes.STRING,
    times: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Visited',
  });
  return Visited;
};