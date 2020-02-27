import { ColumnTypeUndefinedError } from '../exceptions';
import { ColumnConfig, ColumnType, SchemaBuilder } from '../schemaBuilder';

/**
 * Si le type n'est pas donné explicitement, on essaie de le deviner
 * @param type
 * @param object
 * @param propertyName
 */
function getTypeAtRuntimeIfUndefined(type: ColumnType | undefined, object: any, propertyName: string): ColumnType|undefined {
  const reflectMetadataType = Reflect && (Reflect as any).getMetadata ? Reflect.getMetadata('design:type', object, propertyName) : undefined;
  if (!type && reflectMetadataType) {
    switch (reflectMetadataType.name) {
      case 'String':
        type = 'varchar'
        break
      case 'Number':
        type = 'int'
        break
      case 'Boolean':
        type = 'bool'
        break
      default:
        type = undefined
        break
    }
  }
  return type
}

// Si aucun paramètre, on va chercher le type de la propriété
export function Column(): Function;

// On passe seulement le type
export function Column(columnType: ColumnType): Function;

// On passe seulement la config
export function Column(config: ColumnConfig): Function;

// On passe le type et la config
export function Column(columnType: ColumnType, config: ColumnConfig): Function;

// à chaque prop est associé sa config
export default function Column(typeOrConfig?: ColumnType | ColumnConfig, config?: ColumnConfig): any {
  return function (object: any, propertyName: string) {
    // Permet d'exclure les classes qui n'étendent pas de 'Model'
    if (!object.constructor.initConfig) return;

    let type: ColumnType | undefined;
    if (typeof typeOrConfig === 'string') {
      // si jamais l'argument est de type 'string', ça veut dire qu'on a passé directement le type en paramètres=
      type = typeOrConfig as ColumnType;
    } else if (typeOrConfig) {
      // si jamais ce n'est pas de type 'string', et que l'argument existe quand meme, c'est un objet Config et on va chercher le type
      config = typeOrConfig as ColumnConfig;
      type = typeOrConfig.type;
    }
    // on crée un objet config si il n'existe pas déjà
    if (!config) config = {} as ColumnConfig;
    type = getTypeAtRuntimeIfUndefined(type, object, propertyName);
    // Si le type n'a pas été passé dans la config, on y met celui deviné
    if (!config.type && type) config.type = type;
    if (!config.type) throw new ColumnTypeUndefinedError(object, propertyName);
    SchemaBuilder.registerColumnConfig(object, propertyName, config)
  };
}
