// eslint-disable-next-line import/prefer-default-export
export class ColumnTypeUndefinedError extends Error {
  name = 'ColumnTypeUndefinedError';

  constructor(object: any, propertyName: string) {
    super();
    this.message = `Column type for ${object.constructor.name}#${propertyName} is not defined and cannot be guessed. `
      + 'Also make sure you have imported "reflect-metadata" on top of the main entry file in your application (before any entity imported).'
      + 'If you are using JavaScript instead of TypeScript you must explicitly provide a column type.';
  }
}
