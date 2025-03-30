'use strict';
const {
  Model
} = require('sequelize');
const crypto = require('crypto')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Post, { foreignKey: 'userId', targetKey: 'id', as: 'posts' })
      User.belongsTo(models.Role, { foreignKey: 'role', targetKey: 'code', as: 'roleData' })
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    phone: DataTypes.STRING,
    zalo: DataTypes.STRING,
    fbUrl: DataTypes.STRING,
    avatar: DataTypes.STRING,
    resetPasswordToken: {
      type: DataTypes.STRING,
      set(value) {
        if (!value) {
          this.setDataValue('resetPasswordToken', '')
        } else {
          const hashedToken = crypto.createHash('sha256').update(value).digest('hex')
          this.setDataValue('resetPasswordToken', hashedToken)
        }
      }
    },
    resetPasswordExpiry: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};