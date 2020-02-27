import { NonFunctionKeys } from 'utility-types';
import Knex, { QueryBuilder } from 'knex';

export enum QueryFilterOrder {
  Asc = 'asc',
  Desc = 'desc',
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

export enum RelationType {
  BelongsTo = 'belongsTo',
  HasMany = 'hasMany',
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

type SchemaOf<T extends object> = Pick<T, NonFunctionKeys<T>>

type ModelIdType = number | string

export interface ModelClass<T extends Model> {
  config: ModelConfig;
  database: Knex;
  [x: string]: any; // les fonctions
  new(data: SchemaOf<T>): T;
}

export default class Model {
  public static config: ModelConfig;

  public static database: Knex;

  id!: string | number

  constructor(data: SchemaOf<Model>) {
    Object.assign(this, data)
  }

  // Pour récupérer une variable statique à partir d'une méthode d'instance
  get modelClass(): typeof Model {
    return this.constructor as typeof Model
  }

  static async find<T extends Model>(this: ModelClass<T>, filter?: QueryFilter): Promise<T[]> {
    let request = this.database.select().from<T>(this.config.tableName as string)
    if (filter) {
      request = Model.filterQuery(request, filter)
    }
    const objects: any[] = await request
    return objects.map((object: T) => new this(object))
  }

  static filterQuery<T extends Model>(request: QueryBuilder, filter: QueryFilter): QueryBuilder {
    if (filter.where) {
      for (const key in filter.where) {
        // eslint-disable-next-line no-prototype-builtins
        if (filter.where.hasOwnProperty(key) && filter.where[key]) {
          request.where(key, filter.where[key])
        }
      }
    }
    if (filter.limit) request.limit(filter.limit)
    if (filter.offset) request.offset(filter.offset)
    const order = filter.order ? filter.order : QueryFilterOrder.Asc
    if (filter.sort) request.orderBy(filter.sort, order)

    return request
  }

  static async findById<T extends Model>(this: ModelClass<T>, id: ModelIdType, options?: FindByIdOptions): Promise<T | undefined> {
    const objectData: any = await this.database.first().from<T>(this.config.tableName as string).where('id', id);
    if (objectData === undefined) return undefined
    let object: T = new this(objectData);
    object = await Model.loadRelations(object, this.config, options);
    return object;
  }

  static async loadRelations<T extends Model>(object: T, config: ModelConfig, options?: FindByIdOptions): Promise<T> {
    if (options && options.includes.length && config.relations) {
      const { relations } = config
      for (const include of options.includes) {
        if (config.relations[include]) {
          const relation = relations[include];
          object = await Model.loadRelation(object, relation, include);
        }
      }
    }
    return object
  }

  static async loadRelation<T extends Model>(object: T, relation: Relation, include: string): Promise<T> {
    const relationProperty: keyof T = include as keyof T
    const foreignKeyName = relation.foreignKey as keyof T
    if (relation.type === RelationType.HasMany) {
      object[relationProperty] = await relation.model.find({
        where: {
          [foreignKeyName]: object.id,
        },
      })
    } else if (relation.type === RelationType.BelongsTo) {
      object[relationProperty] = await relation.model.findById(object[foreignKeyName])
    }
    return object
  }

  static async create<T extends Model>(this: ModelClass<T>, dataOrModel: Partial<SchemaOf<T>> | T): Promise<T> {
    const [id] = await this.database(this.config.tableName).insert(dataOrModel)
    return this.findById(id)
  }

  static async createFromList<T extends Model>(
    this: ModelClass<T>,
    dataOrModelArray: (Partial<SchemaOf<T>> | T)[],
  ): Promise<T[]> {
    const resources = []
    await this.database(this.config.tableName).insert(dataOrModelArray) // Unfortunately it does not return the list of ids, only the last one.
    for (
      const record of await this.database
        .from<T>(this.getTableName())
        // @ts-ignore
        .whereIn('id', dataOrModelArray.map((value) => value.id))
    ) {
      resources.push(new this(record))
    }
    return resources
  }

  static async updateById<T extends Model>(this: ModelClass<T>, model: T): Promise<T>

  static async updateById<T extends Model>(this: ModelClass<T>, id: ModelIdType, data: Partial<SchemaOf<T>>): Promise<T>

  static async updateById<T extends Model>(this: ModelClass<T>, idOrModel: ModelIdType | T, data?: Partial<SchemaOf<T>>): Promise<T | void> {
    let id = idOrModel
    if (idOrModel && typeof idOrModel === 'object') {
      id = idOrModel.id
      data = idOrModel
    }
    const object = await this.findById(id);
    return object.update(data);
  }

  static async deleteById(id: ModelIdType): Promise<boolean> {
    const response = await this.database(this.config.tableName).where('id', id).del()
    return !!response
  }

  static async deleteByIdList(ids: ModelIdType[]): Promise<boolean> {
    const response = await this.database(this.config.tableName).whereIn('id', ids).del()
    return !!response
  }

  static initConfig(): void {
    if (this.config === undefined) {
      this.config = {
        tableName: this.getTableName(),
      }
    } else if (this.config.tableName === undefined) {
      this.config.tableName = this.getTableName()
    }
  }

  static getClassName(): string {
    return this.toString().split('(' || /s+/)[0].split(' ' || /s+/)[1]
  }

  static getTableName(): string {
    const className = this.getClassName().toLowerCase()
    // Gestion des exceptions des mots en -y
    if (className.charAt((className.length - 1)) === 'y' && !['a', 'e', 'i', 'o', 'u'].includes(className.charAt(className.length - 2))) {
      return `${className.substring(0, className.length - 1)}ies`
    }
    return `${className}s`
  }

  async save<T extends Model>(): Promise<T> {
    await this.modelClass.database(this.modelClass.config.tableName).where({ id: this.id }).update(this)
    return this as unknown as T
  }

  async update<T extends Model>(data: Partial<SchemaOf<T>>): Promise<T> {
    Object.assign(this, data)
    return this.save()
  }

  async remove(): Promise<void> {
    await this.modelClass.deleteById(this.id)
  }
}
