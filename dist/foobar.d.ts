/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import Controller from './controller';
import Model from './orm/model';
import Knex from "knex";
interface FoobarBootstrapInformation {
    controllerClasses: Record<string, typeof Controller>;
    modelClasses: Record<string, typeof Model>;
    host: string;
    port: number;
    config: object;
}
export default class Foobar {
    private controllers;
    private models;
    private readonly host;
    private readonly port;
    private router;
    database: Knex;
    constructor(bootstrapInformation: FoobarBootstrapInformation);
    onRequest(req: IncomingMessage, res: ServerResponse): void;
    start(): void;
}
export {};
