// This file contains the Foobar class which contains all the information needed to launch the framework.

import { createServer, IncomingMessage, ServerResponse } from 'http'
import { Category } from 'typescript-logging';
import Controller from './controller'
import Model from './orm/model'
import { SchemaBuilder } from './orm/schemaBuilder';
import Router from './router'
import Knex from "knex";

interface FoobarBootstrapInformation {
  controllerClasses: Record<string, typeof Controller>;
  modelClasses: Record<string, typeof Model>;
  host: string;
  port: number;
  config: object;
}

const logger = new Category('foobar')

export default class Foobar {
  private controllers: typeof Controller[]

  private models: typeof Model[]

  private readonly host: string

  private readonly port: number

  private router: Router

  public database: Knex

  constructor(bootstrapInformation: FoobarBootstrapInformation) {
    this.database = Knex(bootstrapInformation.config as Knex.Config);
    Model.database = this.database
    this.controllers = Object.values(bootstrapInformation.controllerClasses)
    this.models = Object.values(bootstrapInformation.modelClasses);
    SchemaBuilder.database = this.database;
    (async (): Promise<void> => {
      await SchemaBuilder.syncDatabase();
    })()
    this.host = bootstrapInformation.host
    this.port = bootstrapInformation.port
    this.router = new Router(this.controllers)
  }

  onRequest(req: IncomingMessage, res: ServerResponse): void {
    this.router.route(req, res).catch(
      (err) => {
        res.statusCode = err.statusCode ? err.statusCode : 500
        res.setHeader('Content-Type', 'text/plain')
        res.write(err.toString())
        if (res.statusCode >= 500) logger.warn(err.toString())
      },
    ).finally(
      () => {
        const message = `${res.statusCode} ${req.method} ${req.url}`
        if (res.statusCode >= 500) {
          logger.warn(message)
        } else {
          logger.info(message)
        }
        res.end()
      },
    )
  }

  start(): void {
    createServer(this.onRequest.bind(this))
      .listen(this.port, this.host, () => {
        console.log(`listening on http://${this.host}:${this.port}`)
      })
  }
}
