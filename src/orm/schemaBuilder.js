"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const model_1 = require("./model");
class SchemaBuilder {
    static registerRelationConfig(object, foreignKeyName, relationConfig) {
        var _a;
        let tableConfigMapper = this.modelToTableConfigMapper.get(object);
        if (!((_a = tableConfigMapper === null || tableConfigMapper === void 0 ? void 0 : tableConfigMapper.relationsConfig) === null || _a === void 0 ? void 0 : _a.size)) {
            tableConfigMapper = this.initTableConfig(object, tableConfigMapper);
        }
        tableConfigMapper.relationsConfig.set(foreignKeyName, relationConfig);
    }
    static registerColumnConfig(object, propertyName, columnConfig) {
        var _a;
        // on récupère les colonnes du modèle déjà enregistrés
        let tableConfigMapper = this.modelToTableConfigMapper.get(object);
        // si aucune colonne n'a encore été défini pour ce modèle, on crée le mapper colonne / config pour ce modèle
        if (!((_a = tableConfigMapper === null || tableConfigMapper === void 0 ? void 0 : tableConfigMapper.columnsConfig) === null || _a === void 0 ? void 0 : _a.size)) {
            tableConfigMapper = this.initTableConfig(object, tableConfigMapper);
        }
        // on ajoute la config de colonne à ce mapper
        tableConfigMapper.columnsConfig.set(propertyName, columnConfig);
    }
    static initTableConfig(object, tableConfigMapper) {
        // on initialise la config du modèle qui génère le nom de la table
        object.constructor.initConfig();
        const previousColumnsConfig = (tableConfigMapper === null || tableConfigMapper === void 0 ? void 0 : tableConfigMapper.columnsConfig.size) ? tableConfigMapper === null || tableConfigMapper === void 0 ? void 0 : tableConfigMapper.columnsConfig : new Map();
        tableConfigMapper = {
            columnsConfig: previousColumnsConfig,
            relationsConfig: new Map(),
            tableName: object.constructor.config.tableName,
        };
        // Par défaut on met une colonne ID
        tableConfigMapper.columnsConfig.set('id', { type: 'increment' });
        this.modelToTableConfigMapper.set(object, tableConfigMapper);
        return tableConfigMapper;
    }
    static syncDatabase() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.createOrUpdateTables();
        });
    }
    static createOrUpdateTables() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const [object, tableConfig] of this.modelToTableConfigMapper) {
                yield this.createOrUpdateTable(object, tableConfig);
            }
        });
    }
    static createOrUpdateTable(object, tableConfig) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const hasTable = yield model_1.database.schema.hasTable(tableConfig.tableName);
            const definedColumns = tableConfig.columnsConfig;
            const definedRelations = tableConfig.relationsConfig;
            if (!hasTable) {
                yield this.createTable(object, tableConfig, definedColumns, definedRelations);
            }
            else {
                // await this.updateTable(object, tableConfig, definedColumns)
            }
        });
    }
    static createTable(object, tableConfig, definedColumns, definedRelations) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield model_1.database.schema.createTable(tableConfig.tableName, (table) => {
                for (const [columnName, columnConfig] of definedColumns) {
                    this.createColumn(table, columnName, columnConfig);
                }
                for (const [foreignKey, relationConfig] of definedRelations) {
                    this.createForeignKey(table, tableConfig.tableName, foreignKey, relationConfig);
                }
            });
        });
    }
    static createForeignKey(table, tableName, columnName, relationConfig) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            table.integer(columnName).unsigned();
            table.foreign(columnName).references(`${tableName}.${relationConfig.referencedKey}`);
        });
    }
    /**
     * Il faudrait idéalement faire un vrai système de migration : Trop chronophage à implémenter
     * Solution temporaire : Ajouter les colonnes du modèles absentes de la base et supprimer les colonnes de la base absentes du modèle
     * /!\ Mais ça ne modifie pas les propriétés des colonnes existantes
     */
    static updateTable(object, tableConfig, definedColumns) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const existingColumns = yield model_1.database(tableConfig.tableName).columnInfo();
            const existingColumnsNames = Object.keys(existingColumns);
            const definedColumnsNames = Array.from(definedColumns.keys());
            const arrayDiff = function (array1, array2) {
                return array1.filter((i) => array2.indexOf(i) < 0);
            };
            const columnsToCreate = arrayDiff(definedColumnsNames, existingColumnsNames);
            const columnsToDelete = arrayDiff(existingColumnsNames, definedColumnsNames);
            yield model_1.database.schema.table(tableConfig.tableName, (table) => {
                for (const columnName of columnsToCreate) {
                    const columnConfig = definedColumns.get(columnName);
                    this.createColumn(table, columnName, columnConfig);
                }
                for (const columnName of columnsToDelete) {
                    this.deleteColumn(table, columnName);
                }
            });
        });
    }
    static createColumn(table, columnName, columnConfig) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const columnType = columnConfig.type;
            const functionName = this.columnTypeToSqlBuilderFunctionMapper.get(columnType);
            if (functionName) {
                // @ts-ignore
                table[functionName](columnName);
            }
        });
    }
    static deleteColumn(table, columnName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            table.dropColumn(columnName);
        });
    }
}
exports.SchemaBuilder = SchemaBuilder;
// On map la classe à un map de ses colonnes associées à leurs config ex: <Author, <id, idProps>> <Author, <name, nameProps>>
SchemaBuilder.modelToTableConfigMapper = new Map();
SchemaBuilder.columnTypeToSqlBuilderFunctionMapper = new Map([
    ['increment', 'increments'],
    ['boolean', 'boolean'],
    ['bool', 'boolean'],
    ['varchar', 'string'],
    ['text', 'text'],
    ['datetime', 'datetime'],
    ['date', 'date'],
    ['int', 'integer'],
    ['bigint', 'bigInteger'],
    ['double', 'float'],
    ['blob', 'binary'],
]);
