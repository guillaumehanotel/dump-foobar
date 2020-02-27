import 'reflect-metadata';
import Knex, { AlterTableBuilder, CreateTableBuilder } from 'knex';
export declare type ColumnType = 'boolean' | 'bool' | 'varchar' | 'text' | 'datetime' | 'date' | 'int' | 'increment' | 'bigint' | 'double' | 'blob';
export interface ColumnConfig {
    type: ColumnType;
}
export interface RelationConfig {
    model: any;
    referencedKey: string;
}
export interface TableConfig {
    columnsConfig: Map<string, ColumnConfig>;
    relationsConfig: Map<string, RelationConfig>;
    tableName: string;
}
export declare class SchemaBuilder {
    static database: Knex;
    private static modelToTableConfigMapper;
    private static columnTypeToSqlBuilderFunctionMapper;
    static registerRelationConfig(object: any, foreignKeyName: string, relationConfig: RelationConfig): void;
    static registerColumnConfig(object: any, propertyName: any, columnConfig: ColumnConfig): void;
    static initTableConfig(object: any, tableConfigMapper: TableConfig | undefined): TableConfig;
    static syncDatabase(): Promise<void>;
    static createOrUpdateTables(): Promise<void>;
    static createOrUpdateTable(object: any, tableConfig: TableConfig): Promise<void>;
    static createTable(object: any, tableConfig: TableConfig, definedColumns: Map<string, ColumnConfig>, definedRelations: Map<string, RelationConfig>): Promise<void>;
    static createForeignKey(table: CreateTableBuilder | AlterTableBuilder, tableName: string, columnName: string, relationConfig: RelationConfig): Promise<void>;
    /**
     * Il faudrait idéalement faire un vrai système de migration : Trop chronophage à implémenter
     * Solution temporaire : Ajouter les colonnes du modèles absentes de la base et supprimer les colonnes de la base absentes du modèle
     * /!\ Mais ça ne modifie pas les propriétés des colonnes existantes
     */
    static updateTable(object: any, tableConfig: TableConfig, definedColumns: Map<string, ColumnConfig>): Promise<void>;
    static createColumn(table: CreateTableBuilder | AlterTableBuilder, columnName: string, columnConfig: ColumnConfig): Promise<void>;
    static deleteColumn(table: AlterTableBuilder, columnName: string): Promise<void>;
}
