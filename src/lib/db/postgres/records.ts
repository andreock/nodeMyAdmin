import postgres from 'postgres';

export async function records_postgres(ip: string, user: string, pass: string, port: string | undefined, db: string | undefined, table: string){
    if(port == null) throw new Error("Invalid port");
    try {
        const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
            host: ip,
            port: parseInt(port),
            database: db,            // default db
            username: user,
            password: pass,
        });
        const tables = await sql`SELECT * FROM ${sql(table)};`;
        return {
            cols: Object.keys(tables[0]),
            rows: Object.values(tables)
        } 
    } catch (error) {
        throw error;
    }
}