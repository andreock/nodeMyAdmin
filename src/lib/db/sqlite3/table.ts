import { parse_query } from '../helper/helper';
import { execute } from './helper';

export async function get_all_tables_sqlite(path: string) {
    const query = `SELECT 
    name
FROM 
    sqlite_schema
WHERE 
    type ='table';`
    let tables: object[] = await execute(path, query);
    tables = tables.map((table) => table.name)
    return tables;
}

export async function struct_sqlite(path: string, table: string) {
    const query = `PRAGMA table_info(${table});`
    let columns: object[] = await execute(path, query);
    return columns.map((column) => {
        return {
            Field: column.name,
            Type: column.type,
            Key: column.pk,
            Null: !column.notnull,
            Default: column.dflt_value,
            Extra: ""
        };
    });
}

export async function drop_table_sqlite(path: string, table: string) {
    const query = `DROP TABLE IF EXISTS ${table};`;
    await execute(path, query);
}

export async function truncate_table_sqlite(path: string, table: string) {
    const query = `TRUNCATE TABLE ${table};`;
    await execute(path, query);
}

export async function delete_field_sqlite(path: string, table: string, col: string) {
    const query = `ALTER TABLE ${table} DROP COLUMN ${col};`;
    await execute(path, query);
}

export async function search_in_table_sqlite(path: string, table: string, records: object){
    const keys = Object.keys(records);
    const rows = Object.values(records);
    let query = parse_query(keys, rows, table);
    query = query.replace('DELETE FROM', 'SELECT * FROM');
    return await execute(path, query);
}

export async function create_table_sqlite(path: string, table: string, fields: string[]){
    let query = 'CREATE TABLE ' + table + ' (';
    fields.forEach((field) => (query += field + ','));
    query = query.slice(0, -1) + '';
    query += ')';
    await execute(path, query);
}
