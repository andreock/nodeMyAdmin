import mysql from 'mysql2/promise';

export async function get_all_tables_mysql(ip: string, user: string, pass: string, db: string){
	const tables: Array<string> = []; // The tables in database
    const connection = await mysql.createConnection({
        host: ip,
        user: user,
        database: db,
        password: pass
    });

    // get version
    const [tables_raw] = await connection.query('SHOW TABLES;');

    Array.from(tables_raw).forEach((table) => tables.push(Object.values(table)[0])); // Get all tables in a db
    connection.destroy(); // We need to close the connection to prevent saturation of max connections
    return tables;
}

export async function create_table_mysql(ip: string, user: string, pass: string, db: string, table: string, fields: Array<string>){
    const connection = await mysql.createConnection({
        host: ip,
        user: user,
        database: db,
        password: pass
    });
    let query = 'CREATE TABLE ' + table + ' (';
    fields.forEach((field) => (query += field + ','));
    query = query.slice(0, -1) + '';
    query += ')';
    await connection.query(query);
    connection.destroy(); // We need to close the connection to prevent saturation of max connections
}