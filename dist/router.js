"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
function getBody() {
    // @ts-ignore
    if (this.body !== undefined) {
        // @ts-ignore
        return new Promise((resolve) => resolve(this.body));
    }
    return new Promise((resolve) => {
        const body = [];
        this.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            // @ts-ignore
            this.body = body.length === 0 ? undefined : JSON.parse(body.join());
            // @ts-ignore
            resolve(this.body);
        });
    });
}
class Router {
    constructor(controllers) {
        this.controllers = controllers;
    }
    route(request, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const req = request;
            if (req.url === undefined || req.method === undefined) {
                res.statusCode = 500;
            }
            else {
                req.getBody = getBody;
                let methodName;
                const splitUrl = req.url.split('?');
                const path = splitUrl[0].split('/').slice(1);
                for (const ControllerClass of this.controllers) {
                    const customRoute = ControllerClass.customRoutes.find((it) => ((it.path === splitUrl[0]
                        && it.httpMethod.toString() === req.method
                        && it.methodName in ControllerClass.prototype
                        // @ts-ignore
                        && ControllerClass.prototype[it.methodName] instanceof Function)));
                    const standardMethodName = req.method.toLowerCase() + (path.length === 2 ? '' : 'List');
                    if (customRoute) {
                        methodName = customRoute.methodName;
                    }
                    else if (ControllerClass.getPath() === path[0]
                        && [1, 2].includes(path.length)
                        // @ts-ignore
                        && !ControllerClass.disabledRoutes.includes(standardMethodName)
                        && standardMethodName in ControllerClass.prototype
                        // @ts-ignore
                        && ControllerClass.prototype[standardMethodName] instanceof Function) {
                        // @ts-ignore
                        methodName = standardMethodName;
                    }
                    if (methodName) {
                        const { resource, statusCode, headers } = (
                        // @ts-ignore
                        (yield new ControllerClass(req, res)[methodName]())
                            || { resource: undefined, statusCode: undefined, headers: undefined });
                        res.statusCode = statusCode || 200;
                        if (headers) {
                            Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
                            if ('Content-Type' in headers)
                                res.setHeader('Content-Type', 'application/json');
                        }
                        if (resource) {
                            res.write(JSON.stringify(resource));
                        }
                        break;
                    }
                }
                if (!methodName) {
                    res.statusCode = 404;
                }
            }
        });
    }
}
exports.default = Router;
