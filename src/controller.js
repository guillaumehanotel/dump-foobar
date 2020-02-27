"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const querystring_1 = require("querystring");
var HTTPMethod;
(function (HTTPMethod) {
    HTTPMethod["GET"] = "GET";
    HTTPMethod["POST"] = "POST";
    HTTPMethod["PUT"] = "PUT";
    HTTPMethod["PATCH"] = "PATCH";
    HTTPMethod["DELETE"] = "DELETE";
})(HTTPMethod = exports.HTTPMethod || (exports.HTTPMethod = {}));
class BaseError extends Error {
    constructor(m, statusCode = 400) {
        super(m);
        this.statusCode = statusCode;
    }
}
class BadRequest extends BaseError {
}
// todo put it into model
class ConstraintViolation extends BaseError {
}
class Controller {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    static getPath() {
        return `${this.name.split('Controller')[0].toLowerCase()}s`;
    }
    getPath() {
        // @ts-ignore
        return `/${this.constructor.getPath()}`;
    }
    getQueryString() {
        return querystring_1.parse(this.req.url.split('?')[1]);
    }
    getCurrentResourceId() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const urlPathId = parseInt(this.req.url.split('/')[2].split('?')[0], 10);
            const body = yield this.req.getBody();
            if (body && body.id !== urlPathId) {
                throw new BadRequest('Conflict between url id and body id');
            }
            return urlPathId;
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Retrieve representation of the member resource in the response body.
     */
    get() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const queryString = this.getQueryString();
            let includes = 'includes' in queryString ? queryString.includes : [];
            if (typeof includes === 'string') {
                includes = [includes];
            }
            const resource = yield this.modelClass.findById(yield this.getCurrentResourceId(), { includes });
            if (resource !== undefined) {
                return { resource, headers: { 'Content-Type': 'application/json' } };
            }
            return { statusCode: 404 };
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Retrieve the representations of the member resources of the collection resource in the response body.
     */
    getList() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const where = {};
            for (const [key, value] of Object.entries(this.getQueryString())) {
                if (!['limit', 'sort', 'order', 'offset', 'includes'].includes(key)) {
                    where[key] = value;
                }
            }
            const queryFilter = { where };
            Object.assign(queryFilter, this.getQueryString());
            return { resource: yield this.modelClass.find(queryFilter), headers: { 'Content-Type': 'application/json' } };
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Create a member resource in the member resource using the instructions in the request body.
     * The URI of the created member resource is automatically assigned and returned in the response Location header field.
     */
    post() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const resources = yield this.modelClass.find({ where: { id: yield this.getCurrentResourceId() } });
            if (resources.length !== 0) {
                throw new BadRequest('This resource already exists', 422);
            }
            else {
                try {
                    const resource = yield this.modelClass.create(yield this.req.getBody());
                    return { statusCode: 201, headers: { location: `${this.getPath()}/${resource.id}` }, resource };
                }
                catch (e) {
                    if (e.toString().includes('constraint failed')) {
                        throw new ConstraintViolation(e.toString(), 422);
                    }
                    else {
                        throw e;
                    }
                }
            }
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Create a member resource in the collection resource using the instructions in the request body.
     * The URIs of the created members resource are automatically assigned and returned in the response Location header field.
     */
    postList() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const locations = [];
            try {
                for (const model of yield this.modelClass.createFromList(yield this.req.getBody())) {
                    locations.push(`${this.getPath()}/${model.id}`);
                }
                return { statusCode: 201, headers: { Location: JSON.stringify(locations) } };
            }
            catch (e) {
                if (e.toString().includes('constraint failed')) {
                    throw new ConstraintViolation(e.toString(), 422);
                }
                else {
                    throw e;
                }
            }
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Replace all the representations of the member resource or create the member resource if it does not exist,
     * with the representation in the request body.
     */
    put() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const resourceId = yield this.getCurrentResourceId();
            const body = yield this.req.getBody();
            const output = {};
            if (yield this.modelClass.findById(resourceId)) {
                yield this.modelClass.updateById(resourceId, body);
                output.statusCode = 204;
            }
            else {
                yield this.modelClass.create(body);
                output.statusCode = 201;
                output.headers = { Location: `${this.getPath()}/${body.id}` };
            }
            return output;
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Replace all the representations of the member resources of the collection resource with the representation in the request body,
     * or create the collection resource if it does not exist.
     */
    putList() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const promises = [];
            const statusCodes = [];
            const locations = [];
            for (const bodyElement of yield this.req.getBody()) {
                if (yield this.modelClass.findById(bodyElement.id)) {
                    promises.push(this.modelClass.updateById(bodyElement.id, bodyElement));
                    statusCodes.push(204);
                }
                else {
                    promises.push(this.modelClass.create(bodyElement));
                    statusCodes.push(201);
                    locations.push(`${this.getPath()}/${bodyElement.id}`);
                }
            }
            try {
                yield Promise.all(promises);
            }
            catch (e) {
                if (e.toString().includes('constraint failed')) {
                    throw new ConstraintViolation(e.toString(), 422);
                }
                else {
                    throw e;
                }
            }
            const output = {};
            if ((201 in statusCodes && 204 in statusCodes) || statusCodes.length === 0)
                output.statusCode = 200;
            else
                [output.statusCode] = statusCodes;
            if (locations.length !== 0)
                output.headers = { Location: JSON.stringify(locations) };
            return output;
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Update all the representations of the member resource,
     * or may create the member resource if it does not exist, using the instructions in the request body.
     */
    patch() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return { statusCode: 501 };
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Update all the representations of the member resources of the collection resource using the instructions in the request body,
     * or may create the collection resource if it does not exist.
     */
    patchList() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return { statusCode: 501 };
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Delete all the representations of the member resource.
     */
    delete() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.modelClass.deleteById(yield this.getCurrentResourceId());
            return { statusCode: 204 };
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Delete all the representations of the member resources of the collection resource.
     */
    deleteList() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.modelClass.deleteByIdList((yield this.req.getBody()).ids);
            return { statusCode: 204 };
        });
    }
}
exports.default = Controller;
Controller.customRoutes = [];
Controller.disabledRoutes = [];
