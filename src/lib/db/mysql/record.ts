import mysql from 'mysql2/promise';

export async function records_mysql(ip: string, user: string, pass: string, db: string, table: string) {
    try {
            const cols: Array<unknown> = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows: Array<any> = [];

        const connection = await mysql.createConnection({
            host: ip,
            user: user,
            database: db,
            password: pass
        });

        // get version
        const [records, cols_raw] = await connection.query('SELECT * FROM ' + table);
        if (records instanceof Array)
            // Get all records
            for (let i = 0; i < records.length; i++) {
                rows.push(records[i]);
            }

        Array.from(cols_raw).forEach((col) => cols.push(col.name));
        connection.destroy(); // We need to close the connection to prevent saturation of max connections
        return { cols: cols, rows: rows };  
    } catch (error) {
        throw error;
    }
 
}

export async function struct_mysql(ip: string, user: string, pass: string, db: string, table: string){
    try {
        const connection = await mysql.createConnection({
            host: ip,
            user: user,
            database: db,
            password: pass
        });
    
        // get version
        const [fields] = await connection.query('SHOW FIELDS FROM ' + table);
        connection.destroy(); // We need to close the connection to prevent saturation of max connections
        return fields;     
    } catch (error) {
        throw error;
    }
}