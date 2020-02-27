"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// http://knexjs.org/ to get documentation.
const config = {
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'your_db_user',
        password: 'your_db_password',
        database: 'your_db_name',
    },
};
exports.default = config;
