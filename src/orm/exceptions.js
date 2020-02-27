"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line import/prefer-default-export
class ColumnTypeUndefinedError extends Error {
    constructor(object, propertyName) {
        super();
        this.name = 'ColumnTypeUndefinedError';
        this.message = `Column type for ${object.constructor.name}#${propertyName} is not defined and cannot be guessed. `
            + 'Also make sure you have imported "reflect-metadata" on top of the main entry file in your application (before any entity imported).'
            + 'If you are using JavaScript instead of TypeScript you must explicitly provide a column type.';
    }
}
exports.ColumnTypeUndefinedError = ColumnTypeUndefinedError;
