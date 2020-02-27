import { RelationType } from '../model';
import { RelationConfig, SchemaBuilder } from '../schemaBuilder';

// il faut créer une colonne qui sera la clé
export default function BelongsTo(objectRelation: any, foreignKeyName: string, referencedTableKey = 'id'): any {
  return function (object: any, propertyName: string) {
    object.constructor.config.relations = {
      [propertyName]: {
        type: RelationType.BelongsTo,
        model: objectRelation,
        foreignKey: foreignKeyName,
      },
    }
    const relationConfig: RelationConfig = {
      model: objectRelation,
      referencedKey: referencedTableKey,
    }
    SchemaBuilder.registerRelationConfig(object, foreignKeyName, relationConfig)
  }
}
