'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Post.belongsTo(models.Image, { foreignKey: 'imagesId', targetKey: 'id', as: 'images' })
            Post.belongsTo(models.Attribute, { foreignKey: 'attributesId', targetKey: 'id', as: 'attributes' })
            Post.belongsTo(models.Overview, { foreignKey: 'overviewId', targetKey: 'id', as: 'overviews' })
            Post.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id', as: 'user' })
            Post.belongsTo(models.Label, { foreignKey: 'labelCode', targetKey: 'code', as: 'labelData' })
            Post.hasMany(models.Expired, { foreignKey: 'pid', targetKey: 'id', as: 'expireds' })
            Post.hasMany(models.Vote, { foreignKey: 'pid', targetKey: 'id', as: 'votes' })
            Post.hasMany(models.Comment, { foreignKey: 'pid', targetKey: 'id', as: 'comments' })
            Post.hasMany(models.Wishlist, { foreignKey: 'pid', targetKey: 'id', as: 'lovers' })
            Post.belongsTo(models.Category, { foreignKey: 'categoryCode', targetKey: 'code', as: 'category' })
        }
    }
    Post.init({
        title: DataTypes.STRING,
        star: DataTypes.STRING,
        labelCode: DataTypes.STRING,
        address: DataTypes.STRING,
        attributesId: DataTypes.STRING,
        categoryCode: DataTypes.STRING,
        priceCode: DataTypes.STRING,
        areaCode: DataTypes.STRING,
        provinceCode: DataTypes.STRING,
        description: {
            type: DataTypes.TEXT,
            get() {
                const raw = this.getDataValue('description')
                return raw ? JSON.parse(raw) : null
            }
        },
        userId: DataTypes.STRING,
        overviewId: DataTypes.STRING,
        imagesId: DataTypes.STRING,
        priceNumber: DataTypes.FLOAT,
        areaNumber: DataTypes.FLOAT,
        expired: DataTypes.DATE,
        status: {
            type: DataTypes.ENUM,
            values: ['ACTIVE', 'RENTED']
        },
    }, {
        sequelize,
        modelName: 'Post',
    });
    return Post;
};