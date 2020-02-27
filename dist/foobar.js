"use strict";
// This file contains the Foobar class which contains all the information needed to launch the framework.
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const http_1 = require("http");
const typescript_logging_1 = require("typescript-logging");
const schemaBuilder_1 = require("./orm/schemaBuilder");
const router_1 = tslib_1.__importDefault(require("./router"));
const logger = new typescript_logging_1.Category('foobar');
class Foobar {
    constructor(bootstrapInformation) {
        this.controllers = Object.values(bootstrapInformation.controllerClasses);
        this.models = Object.values(bootstrapInformation.modelClasses);
        (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield schemaBuilder_1.SchemaBuilder.syncDatabase();
        }))();
        this.host = bootstrapInformation.host;
        this.port = bootstrapInformation.port;
        this.router = new router_1.default(this.controllers);
        Foobar.config = bootstrapInformation.config;
    }
    onRequest(req, res) {
        this.router.route(req, res).catch((err) => {
            res.statusCode = err.statusCode ? err.statusCode : 500;
            res.setHeader('Content-Type', 'text/plain');
            res.write(err.toString());
            if (res.statusCode >= 500)
                logger.warn(err.toString());
        }).finally(() => {
            const message = `${res.statusCode} ${req.method} ${req.url}`;
            if (res.statusCode >= 500) {
                logger.warn(message);
            }
            else {
                logger.info(message);
            }
            res.end();
        });
    }
    start() {
        http_1.createServer(this.onRequest.bind(this))
            .listen(this.port, this.host, () => {
            console.log(`listening on http://${this.host}:${this.port}`);
        });
    }
}
exports.default = Foobar;
