import mssql from 'mssql';

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
        console.log(err)
        return "";
    }
}

export async function create_table_mssql(ip: string, user: string, password: string, db: string, table: string, fields: Array<string>){
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
        let query = 'CREATE TABLE ' + table + ' (';
        fields.forEach((field) => (query += field + ','));
        query = query.slice(0, -1) + '';
        query += ')';
        // make sure that any items are correctly URL encoded in the connection string
        await mssql.connect(sqlConfig)
        const result = await mssql.query(query);
        const tables = Array.from(result.recordset).map(table => table.name);
        return tables;
    } catch (err) {
        console.log(err)
        return "";
    }

}