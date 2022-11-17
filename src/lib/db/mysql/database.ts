import mysql from 'mysql2/promise';

export async function get_all_dbs_mysql(ip: string, user: string, pass: string): Promise<Array<string>>{
    let databases: Array<string> = [];
    const connection = await mysql.createConnection({
        host: ip,
        user: user,
        database: 'sys',
        password: pass
    });

    const [databases_raw] = await connection.query('SHOW DATABASES;'); // Get all databases
    Array.from(databases_raw).forEach((db) => {
        databases.push(db.Database);
    });
    connection.destroy();
    return databases;

}