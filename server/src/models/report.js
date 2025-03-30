'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(models.Post, { targetKey: 'id', foreignKey: 'pid', as: 'reportPost' })
    }
  }
  Report.init({
    pid: DataTypes.STRING,
    reason: DataTypes.STRING,
    title: DataTypes.STRING,
    uid: DataTypes.STRING,
    seen: DataTypes.BOOLEAN,
    status: {
      type: DataTypes.ENUM,
      values: ['Accepted', 'Pending', 'Canceled']
    },
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};