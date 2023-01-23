import { Logger } from '../helper/helper';
import sqlite3 from 'sqlite3';

const logger = new Logger();

export function execute(path: string, query: string): Promise <object[]>{
    return new Promise((resolve) => {
        let db = new sqlite3.Database(path, (err) => {
            if (err) {
                logger.Error(err);
            }
        });

        db.all(query, [], function (err, row) {
            if(err){
                logger.Error(err);
            }else{
                resolve(row);
            }
        });
        db.close();
    })
}

export function execute_with_params(path: string, query: string, params: string[]): Promise <object[]>{
    return new Promise((resolve) => {
        let db = new sqlite3.Database(path, (err) => {
            if (err) {
                logger.Error(err);
            }
        });

        db.all(query, params, function (err, row) {
            if(err){
                console.error(err);
                logger.Error(err);
            }else{
                resolve(row);
            }
        });
        db.close();
    })
}