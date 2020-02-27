"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../model");
function HasMany(objectRelation, foreignKeyName) {
    return function (object, propertyName) {
        object.constructor.config.relations = {
            [propertyName]: {
                type: model_1.RelationType.HasMany,
                model: objectRelation,
                foreignKey: foreignKeyName,
            },
        };
    };
}
exports.default = HasMany;
