"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../model");
const schemaBuilder_1 = require("../schemaBuilder");
// il faut créer une colonne qui sera la clé
function BelongsTo(objectRelation, foreignKeyName, referencedTableKey = 'id') {
    return function (object, propertyName) {
        object.constructor.config.relations = {
            [propertyName]: {
                type: model_1.RelationType.BelongsTo,
                model: objectRelation,
                foreignKey: foreignKeyName,
            },
        };
        const relationConfig = {
            model: objectRelation,
            referencedKey: referencedTableKey,
        };
        schemaBuilder_1.SchemaBuilder.registerRelationConfig(object, foreignKeyName, relationConfig);
    };
}
exports.default = BelongsTo;
