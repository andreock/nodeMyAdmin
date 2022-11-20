import mssql from 'mssql';
import { parse_query } from '../helper/helper';

export async function get_all_tables_mssql(ip: string, user: string, password: string, db: string): Promise<string> {
    const sqlConfig = {
        user: user,
        password: password,
        database: db, // this is the default database
        server: ip,
        pool: {
            max: 1,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true, // for azure
            trustServerCertificate: true // change to true for local dev / self-signed certs
        }
    }
    try {
        // make sure that any items are correctly URL encoded in the connection string
        await mssql.connect(sqlConfig)
        const result = await mssql.query("SELECT * FROM " + db + ".sys.Tables");
        const tables = result.recordset.map((table: { name: any; }) => {
            return table.name;
        });
        return tables;
    } catch (err) {
        throw err;
           
    }
}

export async function create_table_mssql(ip: string, user: string, password: string, db: string, table: string, fields: Array<string>){
    console.log(db)
    const sqlConfig = {
        user: user,
        password: password,
        database: db, // this is the default database
        server: ip,
        pool: {
            max: 1,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true, // for azure
            trustServerCertificate: true // change to true for local dev / self-signed certs
        }
    }
    try {
        let query = 'CREATE TABLE ' + db + ".dbo." + table + ' (';
        fields.forEach((field) => (query += field + ','));
        query = query.slice(0, -1) + '';
        query += ')';
        console.log(query)
        // make sure that any items are correctly URL encoded in the connection string
        await mssql.connect(sqlConfig)
        await mssql.query(query);
    } catch (err) {
        throw err;
        
    }
}

export async function drop_table_mssql(ip: string, user: string, password: string, db: string, table: string){
    const sqlConfig = {
        user: user,
        password: password,
        database: db, // this is the default database
        server: ip,
        pool: {
            max: 1,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true, // for azure
            trustServerCertificate: true // change to true for local dev / self-signed certs
        }
    }
    try {
        
        // make sure that any items are correctly URL encoded in the connection string
        await mssql.connect(sqlConfig)
        await mssql.query("DROP TABLE " + db + ".dbo." + table);
    } catch (err) {
        throw err;
        
    }   
}

export async function truncate_table_mssql(ip: string, user: string, password: string, db: string, table: string){
    const sqlConfig = {
        user: user,
        password: password,
        database: db, // this is the default database
        server: ip,
        pool: {
            max: 1,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true, // for azure
            trustServerCertificate: true // change to true for local dev / self-signed certs
        }
    }
    try {
        
        // make sure that any items are correctly URL encoded in the connection string
        await mssql.connect(sqlConfig)
        await mssql.query("TRUNCATE TABLE " + db + ".dbo." + table);
    } catch (err) {
        throw err;
        
    }   
}

export async function delete_field_mssql(ip: string, user: string, password: string, db: string, table: string, col: string){
    const sqlConfig = {
        user: user,
        password: password,
        database: db, // this is the default database
        server: ip,
        pool: {
            max: 1,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true, // for azure
            trustServerCertificate: true // change to true for local dev / self-signed certs
        }
    }
    try {
        // make sure that any items are correctly URL encoded in the connection string
        await mssql.connect(sqlConfig)
        await mssql.query('ALTER TABLE ' + db + ".dbo." + table + ' DROP COLUMN ' + col);
    } catch (err) {
        throw err;
    }   
}

export async function search_in_table_mssql(ip: string, user: string, password: string, db: string, table: string, records: object) {
    try {
        const keys = Object.keys(records);
		const rows = Object.values(records);
		let query = parse_query(keys, rows, table);
		query = query.replace('DELETE FROM', 'SELECT * FROM');
        const sqlConfig = {
            user: user,
            password: password,
            database: db, // this is the default database
            server: ip,
            pool: {
                max: 1,
                min: 0,
                idleTimeoutMillis: 30000
            },
            options: {
                encrypt: true, // for azure
                trustServerCertificate: true // change to true for local dev / self-signed certs
            }
        }
        try {
            // make sure that any items are correctly URL encoded in the connection string
            await mssql.connect(sqlConfig)
            const result = await mssql.query(query);
            return result.recordset;
        } catch (err) {
            throw err;
        }   
    } catch (error) {
        
    }
}