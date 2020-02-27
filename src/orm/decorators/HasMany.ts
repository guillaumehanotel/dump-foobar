import { RelationType } from '../model';

export default function HasMany(objectRelation: any, foreignKeyName: string): any {
  return function (object: any, propertyName: string) {
    object.constructor.config.relations = {
      [propertyName]: {
        type: RelationType.HasMany,
        model: objectRelation,
        foreignKey: foreignKeyName,
      },
    }
  }
}
