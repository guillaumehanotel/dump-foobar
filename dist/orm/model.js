"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
var QueryFilterOrder;
(function (QueryFilterOrder) {
    QueryFilterOrder["Asc"] = "asc";
    QueryFilterOrder["Desc"] = "desc";
})(QueryFilterOrder = exports.QueryFilterOrder || (exports.QueryFilterOrder = {}));
var RelationType;
(function (RelationType) {
    RelationType["BelongsTo"] = "belongsTo";
    RelationType["HasMany"] = "hasMany";
})(RelationType = exports.RelationType || (exports.RelationType = {}));
class Model {
    constructor(data) {
        Object.assign(this, data);
    }
    // Pour récupérer une variable statique à partir d'une méthode d'instance
    get modelClass() {
        return this.constructor;
    }
    static find(filter) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let request = this.database.select().from(this.config.tableName);
            if (filter) {
                request = Model.filterQuery(request, filter);
            }
            const objects = yield request;
            return objects.map((object) => new this(object));
        });
    }
    static filterQuery(request, filter) {
        if (filter.where) {
            for (const key in filter.where) {
                // eslint-disable-next-line no-prototype-builtins
                if (filter.where.hasOwnProperty(key) && filter.where[key]) {
                    request.where(key, filter.where[key]);
                }
            }
        }
        if (filter.limit)
            request.limit(filter.limit);
        if (filter.offset)
            request.offset(filter.offset);
        const order = filter.order ? filter.order : QueryFilterOrder.Asc;
        if (filter.sort)
            request.orderBy(filter.sort, order);
        return request;
    }
    static findById(id, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const objectData = yield this.database.first().from(this.config.tableName).where('id', id);
            if (objectData === undefined)
                return undefined;
            let object = new this(objectData);
            object = yield Model.loadRelations(object, this.config, options);
            return object;
        });
    }
    static loadRelations(object, config, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (options && options.includes.length && config.relations) {
                const { relations } = config;
                for (const include of options.includes) {
                    if (config.relations[include]) {
                        const relation = relations[include];
                        object = yield Model.loadRelation(object, relation, include);
                    }
                }
            }
            return object;
        });
    }
    static loadRelation(object, relation, include) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const relationProperty = include;
            const foreignKeyName = relation.foreignKey;
            if (relation.type === RelationType.HasMany) {
                object[relationProperty] = yield relation.model.find({
                    where: {
                        [foreignKeyName]: object.id,
                    },
                });
            }
            else if (relation.type === RelationType.BelongsTo) {
                object[relationProperty] = yield relation.model.findById(object[foreignKeyName]);
            }
            return object;
        });
    }
    static create(dataOrModel) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [id] = yield this.database(this.config.tableName).insert(dataOrModel);
            return this.findById(id);
        });
    }
    static createFromList(dataOrModelArray) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const resources = [];
            yield this.database(this.config.tableName).insert(dataOrModelArray); // Unfortunately it does not return the list of ids, only the last one.
            for (const record of yield this.database
                .from(this.getTableName())
                // @ts-ignore
                .whereIn('id', dataOrModelArray.map((value) => value.id))) {
                resources.push(new this(record));
            }
            return resources;
        });
    }
    static updateById(idOrModel, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let id = idOrModel;
            if (idOrModel && typeof idOrModel === 'object') {
                id = idOrModel.id;
                data = idOrModel;
            }
            const object = yield this.findById(id);
            return object.update(data);
        });
    }
    static deleteById(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.database(this.config.tableName).where('id', id).del();
            return !!response;
        });
    }
    static deleteByIdList(ids) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.database(this.config.tableName).whereIn('id', ids).del();
            return !!response;
        });
    }
    static initConfig() {
        if (this.config === undefined) {
            this.config = {
                tableName: this.getTableName(),
            };
        }
        else if (this.config.tableName === undefined) {
            this.config.tableName = this.getTableName();
        }
    }
    static getClassName() {
        return this.toString().split('(' || /s+/)[0].split(' ' || /s+/)[1];
    }
    static getTableName() {
        const className = this.getClassName().toLowerCase();
        // Gestion des exceptions des mots en -y
        if (className.charAt((className.length - 1)) === 'y' && !['a', 'e', 'i', 'o', 'u'].includes(className.charAt(className.length - 2))) {
            return `${className.substring(0, className.length - 1)}ies`;
        }
        return `${className}s`;
    }
    save() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.modelClass.database(this.modelClass.config.tableName).where({ id: this.id }).update(this);
            return this;
        });
    }
    update(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Object.assign(this, data);
            return this.save();
        });
    }
    remove() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.modelClass.deleteById(this.id);
        });
    }
}
exports.default = Model;
