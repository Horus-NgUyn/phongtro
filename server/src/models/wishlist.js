'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Wishlist.belongsTo(models.Post, { foreignKey: 'pid', as: 'wishlistData' })
    }
  }
  Wishlist.init({
    uid: DataTypes.STRING,
    pid: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Wishlist',
  });
  return Wishlist;
};