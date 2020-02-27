import { ModelClass } from './orm/model';
export declare class JsonEncodingException extends Error {
    status: number;
    constructor(message: string);
    statusCode(): number;
}
export declare class MassAssignmentException extends Error {
    status: number;
    constructor(message: string);
    statusCode(): number;
}
export declare class ModelNotFoundException extends Error {
    status: number;
    constructor(id: number | string, modelClass: ModelClass<any>);
    statusCode(): number;
}
export declare class RelationNotFoundException extends Error {
    status: number;
    constructor(modelClass: ModelClass<any>, include: string);
    statusCode(): number;
}
export declare class QueryException extends Error {
    status: number;
    constructor(message: string);
    statusCode(): number;
}
