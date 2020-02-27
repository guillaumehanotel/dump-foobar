import { NonFunctionKeys } from 'utility-types';
import Knex, { QueryBuilder } from 'knex';
export declare enum QueryFilterOrder {
    Asc = "asc",
    Desc = "desc"
}
export interface QueryFilter {
    where?: Record<string, any>;
    limit?: number;
    sort?: string;
    offset?: number;
    order?: QueryFilterOrder;
}
export interface FindByIdOptions {
    includes: string[];
}
export declare enum RelationType {
    BelongsTo = "belongsTo",
    HasMany = "hasMany"
}
export interface Relation {
    type: RelationType;
    model: any;
    foreignKey: string;
}
interface ModelConfig {
    endpoint?: string;
    tableName?: string;
    relations?: Record<string, Relation>;
}
declare type SchemaOf<T extends object> = Pick<T, NonFunctionKeys<T>>;
declare type ModelIdType = number | string;
export interface ModelClass<T extends Model> {
    config: ModelConfig;
    database: Knex;
    [x: string]: any;
    new (data: SchemaOf<T>): T;
}
export default class Model {
    static config: ModelConfig;
    static database: Knex;
    id: string | number;
    constructor(data: SchemaOf<Model>);
    get modelClass(): typeof Model;
    static find<T extends Model>(this: ModelClass<T>, filter?: QueryFilter): Promise<T[]>;
    static filterQuery<T extends Model>(request: QueryBuilder, filter: QueryFilter): QueryBuilder;
    static findById<T extends Model>(this: ModelClass<T>, id: ModelIdType, options?: FindByIdOptions): Promise<T | undefined>;
    static loadRelations<T extends Model>(object: T, config: ModelConfig, options?: FindByIdOptions): Promise<T>;
    static loadRelation<T extends Model>(object: T, relation: Relation, include: string): Promise<T>;
    static create<T extends Model>(this: ModelClass<T>, dataOrModel: Partial<SchemaOf<T>> | T): Promise<T>;
    static createFromList<T extends Model>(this: ModelClass<T>, dataOrModelArray: (Partial<SchemaOf<T>> | T)[]): Promise<T[]>;
    static updateById<T extends Model>(this: ModelClass<T>, model: T): Promise<T>;
    static updateById<T extends Model>(this: ModelClass<T>, id: ModelIdType, data: Partial<SchemaOf<T>>): Promise<T>;
    static deleteById(id: ModelIdType): Promise<boolean>;
    static deleteByIdList(ids: ModelIdType[]): Promise<boolean>;
    static initConfig(): void;
    static getClassName(): string;
    static getTableName(): string;
    save<T extends Model>(): Promise<T>;
    update<T extends Model>(data: Partial<SchemaOf<T>>): Promise<T>;
    remove(): Promise<void>;
}
export {};
