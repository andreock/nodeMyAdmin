import mssql from 'mssql';

export async function records_mssql(ip: string, user: string, password: string, db: string, table: string){
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
        const records = await mssql.query("SELECT * FROM " + table);
        return records.recordset;
    } catch (err) {
        throw err;
        console.log(err);
    }   
}

export async function struct_mssql(ip: string, user: string, password: string, db: string, table: string){
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
        const cols = [];
        // make sure that any items are correctly URL encoded in the connection string
        await mssql.connect(sqlConfig)
        const records = await mssql.query("SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('" + table + "')");
        const cols_raw = records.recordset;
        console.log(records)
        cols_raw.forEach((col: { name: any; system_type_id: any; is_nullable: any; }) => {
            cols.push({
                Field: col.name,
                Type: col.system_type_id,
                Key: "",
                Null: col.is_nullable,
                Default: "",
                Extra: ""
            })
        })
        return cols;
    } catch (err) {
        throw err;
        console.log(err);
    }   
}