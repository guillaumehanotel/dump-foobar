"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exceptions_1 = require("../exceptions");
const schemaBuilder_1 = require("../schemaBuilder");
/**
 * Si le type n'est pas donné explicitement, on essaie de le deviner
 * @param type
 * @param object
 * @param propertyName
 */
function getTypeAtRuntimeIfUndefined(type, object, propertyName) {
    const reflectMetadataType = Reflect && Reflect.getMetadata ? Reflect.getMetadata('design:type', object, propertyName) : undefined;
    if (!type && reflectMetadataType) {
        switch (reflectMetadataType.name) {
            case 'String':
                type = 'varchar';
                break;
            case 'Number':
                type = 'int';
                break;
            case 'Boolean':
                type = 'bool';
                break;
            default:
                type = undefined;
                break;
        }
    }
    return type;
}
// à chaque prop est associé sa config
function Column(typeOrConfig, config) {
    return function (object, propertyName) {
        // Permet d'exclure les classes qui n'étendent pas de 'Model'
        if (!object.constructor.initConfig)
            return;
        let type;
        if (typeof typeOrConfig === 'string') {
            // si jamais l'argument est de type 'string', ça veut dire qu'on a passé directement le type en paramètres=
            type = typeOrConfig;
        }
        else if (typeOrConfig) {
            // si jamais ce n'est pas de type 'string', et que l'argument existe quand meme, c'est un objet Config et on va chercher le type
            config = typeOrConfig;
            type = typeOrConfig.type;
        }
        // on crée un objet config si il n'existe pas déjà
        if (!config)
            config = {};
        type = getTypeAtRuntimeIfUndefined(type, object, propertyName);
        // Si le type n'a pas été passé dans la config, on y met celui deviné
        if (!config.type && type)
            config.type = type;
        if (!config.type)
            throw new exceptions_1.ColumnTypeUndefinedError(object, propertyName);
        schemaBuilder_1.SchemaBuilder.registerColumnConfig(object, propertyName, config);
    };
}
exports.default = Column;
