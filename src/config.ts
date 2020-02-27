import { CategoryConfiguration, CategoryServiceFactory, LogLevel } from 'typescript-logging'

// eslint-disable-next-line import/prefer-default-export
export const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: 'db.sqlite3',
  },
}

CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Debug))
