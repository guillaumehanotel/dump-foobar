/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import Controller from './controller';
export default class Router {
    controllers: typeof Controller[];
    constructor(controllers: typeof Controller[]);
    route(request: IncomingMessage, res: ServerResponse): Promise<void>;
}
