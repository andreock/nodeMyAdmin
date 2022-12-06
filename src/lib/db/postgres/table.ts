import postgres from 'postgres';

export async function get_all_tables_postgres(ip: string, user: string, pass: string, port: string | undefined, db: string | undefined){
    if(port == null) throw new Error("Invalid port");
    try {
        const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
            host: ip,
            port: parseInt(port),
            database: db,            // default db
            username: user,
            password: pass,
        });
        const tables = await sql`SELECT * FROM information_schema.tables;`;
        return tables.map(table => table.table_name);   
    } catch (error) {
        throw error;
    }
}

export async function struct_postgres(ip: string, user: string, pass: string, port: string | undefined, db: string | undefined, table: string){
    try {
        if(port == null) throw new Error("Invalid port");
        const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
            host: ip,
            port: parseInt(port),
            database: db,            // default db
            username: user,
            password: pass,
        });
        const columns = await sql`SELECT * FROM  ${ sql(table) }
                                    LIMIT 1`;    // Don't use information_schema because might change, get only first row with all rowsS
        sql.end();
        return Object.keys(columns[0]).map(function(column, i) {
            return {
                Field: column,
				Type: typeof(Object.values(columns[0])[i]) + " - may not be accurate",
				Key: '', // We don't have this property in this query in PostgreSQL
				Null: "", // We don't have this property in this query in PostgreSQL
				Default: '', // We don't have this property in this query in PostgreSQL
				Extra: '' // We don't have this property in this query in PostgreSQL
            };
        }); // Return columns of the first element 
    } catch (error) {
        throw error;  
    }
}