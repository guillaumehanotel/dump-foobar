/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';
import Model from './orm/model';
export interface ClientRequest extends IncomingMessage {
    url: string;
    getBody(): Promise<any>;
}
export declare enum HTTPMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}
interface CustomRoute {
    path: string;
    httpMethod: HTTPMethod;
    methodName: string;
}
interface ControllerOutputSimple {
    resource?: object;
    statusCode?: number;
    headers?: Record<string, string>;
}
interface ControllerOutputList {
    resource?: object[];
    statusCode?: number;
    headers?: Record<string, string>;
}
export default class Controller {
    protected modelClass: typeof Model;
    protected req: ClientRequest;
    protected res: ServerResponse;
    static customRoutes: CustomRoute[];
    static disabledRoutes: string[];
    constructor(req: ClientRequest, res: ServerResponse);
    static getPath(): string;
    getPath(): string;
    getQueryString(): ParsedUrlQuery;
    getCurrentResourceId(): Promise<number>;
    /**
     * Retrieve representation of the member resource in the response body.
     */
    get(): Promise<ControllerOutputSimple | void>;
    /**
     * Retrieve the representations of the member resources of the collection resource in the response body.
     */
    getList(): Promise<ControllerOutputList | void>;
    /**
     * Create a member resource in the member resource using the instructions in the request body.
     * The URI of the created member resource is automatically assigned and returned in the response Location header field.
     */
    post(): Promise<ControllerOutputSimple | void>;
    /**
     * Create a member resource in the collection resource using the instructions in the request body.
     * The URIs of the created members resource are automatically assigned and returned in the response Location header field.
     */
    postList(): Promise<ControllerOutputList | void>;
    /**
     * Replace all the representations of the member resource or create the member resource if it does not exist,
     * with the representation in the request body.
     */
    put(): Promise<ControllerOutputSimple | void>;
    /**
     * Replace all the representations of the member resources of the collection resource with the representation in the request body,
     * or create the collection resource if it does not exist.
     */
    putList(): Promise<ControllerOutputList | void>;
    /**
     * Update all the representations of the member resource,
     * or may create the member resource if it does not exist, using the instructions in the request body.
     */
    patch(): Promise<ControllerOutputSimple | void>;
    /**
     * Update all the representations of the member resources of the collection resource using the instructions in the request body,
     * or may create the collection resource if it does not exist.
     */
    patchList(): Promise<ControllerOutputList | void>;
    /**
     * Delete all the representations of the member resource.
     */
    delete(): Promise<ControllerOutputSimple | void>;
    /**
     * Delete all the representations of the member resources of the collection resource.
     */
    deleteList(): Promise<ControllerOutputList | void>;
}
export {};
