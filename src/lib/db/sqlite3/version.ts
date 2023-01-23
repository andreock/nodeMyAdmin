import sqlite3 from 'sqlite3';
import { Logger } from '../helper/helper';

const logger = new Logger();
let version: string;

function execute(path: string){
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database(path, (err) => {
            if (err) {
                logger.Error(err);
            }
        });
        db.get("select sqlite_version();", [], function (err, row) {
            if(err){
                logger.Error(err);
                resolve("Error during query");
            }else{
                resolve(row["sqlite_version()"]);
            }
        });
        db.close();
    })
}

export async function get_sqlite_version(path: string) {

    return await execute(path);
}