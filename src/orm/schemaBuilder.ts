import 'reflect-metadata';
import Knex, { AlterTableBuilder, CreateTableBuilder } from 'knex';
// import { database } from './model';

export type ColumnType =
  'boolean'
  | 'bool'
  | 'varchar'
  | 'text'
  | 'datetime'
  | 'date'
  | 'int'
  | 'increment'
  | 'bigint'
  | 'double'
  | 'blob';

export interface ColumnConfig {
  type: ColumnType;
  // nullable?: boolean;
  // length?: number; -> dans un 2nd temps
  // unique?: boolean; -> dans un 2nd temps
  // default?: any; -> dans un 2nd temps
}

export interface RelationConfig {
  model: any;
  referencedKey: string;
}

export interface TableConfig {
  columnsConfig: Map<string, ColumnConfig>; // <Nom de la colonne, sa config>
  relationsConfig: Map<string, RelationConfig>; // <Nom de foreignKey, sa config>
  tableName: string;
}

export class SchemaBuilder {

  public static database: Knex;

  // On map la classe à un map de ses colonnes associées à leurs config ex: <Author, <id, idProps>> <Author, <name, nameProps>>
  private static modelToTableConfigMapper: Map<object, TableConfig> = new Map();

  private static columnTypeToSqlBuilderFunctionMapper: Map<ColumnType, string> = new Map<ColumnType, string>([
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

  static registerRelationConfig(object: any, foreignKeyName: string, relationConfig: RelationConfig): void {
    let tableConfigMapper: TableConfig | undefined = this.modelToTableConfigMapper.get(object);
    if (!tableConfigMapper?.relationsConfig?.size) {
      tableConfigMapper = this.initTableConfig(object, tableConfigMapper)
    }
    tableConfigMapper.relationsConfig.set(foreignKeyName, relationConfig);
  }

  static registerColumnConfig(object: any, propertyName: any, columnConfig: ColumnConfig): void {
    // on récupère les colonnes du modèle déjà enregistrés
    let tableConfigMapper: TableConfig | undefined = this.modelToTableConfigMapper.get(object);
    // si aucune colonne n'a encore été défini pour ce modèle, on crée le mapper colonne / config pour ce modèle
    if (!tableConfigMapper?.columnsConfig?.size) {
      tableConfigMapper = this.initTableConfig(object, tableConfigMapper)
    }
    // on ajoute la config de colonne à ce mapper
    tableConfigMapper.columnsConfig.set(propertyName, columnConfig);
  }

  static initTableConfig(object: any, tableConfigMapper: TableConfig|undefined): TableConfig {
    // on initialise la config du modèle qui génère le nom de la table
    object.constructor.initConfig()
    const previousColumnsConfig = (tableConfigMapper?.columnsConfig.size) ? tableConfigMapper?.columnsConfig : new Map<string, ColumnConfig>();
    tableConfigMapper = {
      columnsConfig: previousColumnsConfig,
      relationsConfig: new Map<string, RelationConfig>(),
      tableName: object.constructor.config.tableName,
    } as TableConfig;
    // Par défaut on met une colonne ID
    tableConfigMapper.columnsConfig.set('id', { type: 'increment' });
    this.modelToTableConfigMapper.set(object, tableConfigMapper);
    return tableConfigMapper;
  }

  static async syncDatabase(): Promise<void> {
    await this.createOrUpdateTables();
  }

  static async createOrUpdateTables(): Promise<void> {
    for (const [object, tableConfig] of this.modelToTableConfigMapper) {
      await this.createOrUpdateTable(object, tableConfig)
    }
  }

  static async createOrUpdateTable(object: any, tableConfig: TableConfig): Promise<void> {
    const hasTable = await this.database.schema.hasTable(tableConfig.tableName);
    const definedColumns = tableConfig.columnsConfig;
    const definedRelations = tableConfig.relationsConfig;
    if (!hasTable) {
      await this.createTable(object, tableConfig, definedColumns, definedRelations)
    } else {
      // await this.updateTable(object, tableConfig, definedColumns)
    }
  }

  static async createTable(object: any, tableConfig: TableConfig, definedColumns: Map<string, ColumnConfig>, definedRelations: Map<string, RelationConfig>): Promise<void> {
    await this.database.schema.createTable(tableConfig.tableName, (table) => {
      for (const [columnName, columnConfig] of definedColumns) {
        this.createColumn(table, columnName, columnConfig)
      }
      for (const [foreignKey, relationConfig] of definedRelations) {
        this.createForeignKey(table, tableConfig.tableName, foreignKey, relationConfig)
      }
    })
  }

  static async createForeignKey(table: CreateTableBuilder|AlterTableBuilder, tableName: string, columnName: string, relationConfig: RelationConfig): Promise<void> {
    table.integer(columnName).unsigned()
    table.foreign(columnName).references(`${tableName}.${relationConfig.referencedKey}`)
  }

  /**
   * Il faudrait idéalement faire un vrai système de migration : Trop chronophage à implémenter
   * Solution temporaire : Ajouter les colonnes du modèles absentes de la base et supprimer les colonnes de la base absentes du modèle
   * /!\ Mais ça ne modifie pas les propriétés des colonnes existantes
   */
  static async updateTable(object: any, tableConfig: TableConfig, definedColumns: Map<string, ColumnConfig>): Promise<void> {
    const existingColumns = await this.database(tableConfig.tableName).columnInfo();
    const existingColumnsNames = Object.keys(existingColumns);
    const definedColumnsNames = Array.from(definedColumns.keys());

    const arrayDiff = function (array1: any [], array2: any []): any {
      return array1.filter((i) => array2.indexOf(i) < 0)
    }

    const columnsToCreate = arrayDiff(definedColumnsNames, existingColumnsNames);
    const columnsToDelete = arrayDiff(existingColumnsNames, definedColumnsNames);

    await this.database.schema.table(tableConfig.tableName, (table) => {
      for (const columnName of columnsToCreate) {
        const columnConfig = definedColumns.get(columnName)
        this.createColumn(table, columnName, columnConfig as ColumnConfig)
      }
      for (const columnName of columnsToDelete) {
        this.deleteColumn(table, columnName);
      }
    })
  }

  static async createColumn(table: CreateTableBuilder|AlterTableBuilder, columnName: string, columnConfig: ColumnConfig): Promise<void> {
    const columnType: ColumnType = columnConfig.type
    const functionName: any = this.columnTypeToSqlBuilderFunctionMapper.get(columnType)
    if (functionName) {
      // @ts-ignore
      table[functionName](columnName)
    }
  }

  static async deleteColumn(table: AlterTableBuilder, columnName: string): Promise<void> {
    table.dropColumn(columnName);
  }
}
