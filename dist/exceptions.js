"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JsonEncodingException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.status = 500;
    }
    statusCode() {
        return this.status;
    }
}
exports.JsonEncodingException = JsonEncodingException;
class MassAssignmentException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.status = 500;
    }
    statusCode() {
        return this.status;
    }
}
exports.MassAssignmentException = MassAssignmentException;
class ModelNotFoundException extends Error {
    constructor(id, modelClass) {
        const message = `The ${modelClass.name} with ID ${id} doesn't exist`;
        super(message);
        this.name = this.constructor.name;
        this.status = 404;
    }
    statusCode() {
        return this.status;
    }
}
exports.ModelNotFoundException = ModelNotFoundException;
class RelationNotFoundException extends Error {
    constructor(modelClass, include) {
        const message = `The ${modelClass.name} doesn't have a '${include}' relation`;
        super(message);
        this.name = this.constructor.name;
        this.status = 500;
    }
    statusCode() {
        return this.status;
    }
}
exports.RelationNotFoundException = RelationNotFoundException;
class QueryException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.status = 500;
    }
    statusCode() {
        return this.status;
    }
}
exports.QueryException = QueryException;
