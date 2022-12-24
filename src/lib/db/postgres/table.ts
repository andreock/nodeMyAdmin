import postgres from 'postgres';
import { parse_query } from '../helper/helper';
import { parse_query_postgres } from './helper';

export async function get_all_tables_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined,
	db: string
) {
	try {
		if (port == null) throw new Error('Invalid port');
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db,
			username: user,
			password: pass
		});
		if (db == 'postgres') {
			// Postgres db need this command to work for some strange reason
			const tables = await sql`SELECT *
            FROM pg_catalog.pg_tables WHERE tableowner LIKE ${db};`;
			sql.end();
			return tables.map((table) => table.tablename);
		} else {
			const tables = await sql`select * from pg_catalog.pg_tables where schemaname='public';`;
			sql.end();
			return tables.map((table) => table.tablename);
		}
	} catch (error) {
		throw error;
	}
}

export async function struct_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined,
	db: string | undefined,
	table: string
) {
	try {
		if (port == null) throw new Error('Invalid port');
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db, // default db
			username: user,
			password: pass
		});
		const columns =
			await sql`SELECT attname, atttypid, format_type(atttypid, atttypmod) AS type, attlen, attnotnull, atthasdef
            FROM   pg_attribute
            WHERE  attrelid = ${table}::regclass
            AND    attnum > 0
            AND    NOT attisdropped
            ORDER  BY attnum;
        `; // Don't use information_schema because might change, get only first row with all rowsS
		sql.end();
		return columns.map((column) => {
			return {
				Field: column.attname,
				Type: column.type,
				Key: '', // We don't have this property in this query in MSSQL
				Null: !column.attnotnull,
				Default: column.atthasdef ? "Has a default value, but we don't know it in Postgres" : '',
				Extra: 'Length: ' + column.attlen,
				type_id: column.atttypid
			};
		});
	} catch (error) {
		throw error;
	}
}

export async function delete_field_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined,
	db: string | undefined,
	table: string,
	col: string
) {
	try {
		if (port == null) throw new Error('Invalid port');
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db, // default db
			username: user,
			password: pass
		});
		const tables = await sql`ALTER TABLE ${sql(table)} DROP COLUMN ${sql(col)}`;
		sql.end();
		return tables.map((table) => table.table_name);
	} catch (error) {
		throw error;
	}
}

export async function drop_table_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined,
	db: string | undefined,
	table: string
) {
	try {
		if (port == null) throw new Error('Invalid port');
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db, // default db
			username: user,
			password: pass
		});
		await sql`DROP TABLE ${sql(table)}`;
		sql.end();
	} catch (error) {
		throw error;
	}
}

export async function truncate_table_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined,
	db: string | undefined,
	table: string
) {
	try {
		if (port == null) throw new Error('Invalid port');
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db, // default db
			username: user,
			password: pass
		});
		await sql`TRUNCATE TABLE ${sql(table)}`;
		sql.end();
	} catch (error) {
		throw error;
	}
}

export async function create_table_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined,
	db: string | undefined,
	table: string,
	fields: Array<string>
) {
	try {
		console.error("CREATE TABLE DON'T WORK AND IS REMOVED");
		return;
		if (port == null) throw new Error('Invalid port');
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db, // default db
			username: user,
			password: pass
		});
		let query = '';
		fields.forEach((field) => (query += field + ','));
		query = query.slice(0, -1) + '';
		await sql`CREATE TABLE IF NOT EXISTS ${sql(table)} ( ${sql(query)} )`;
		sql.end();
	} catch (error) {
		throw error;
	}
}

export async function search_in_table_postgres(
	ip: string,
	user: string,
	pass: string,
	db: string,
	table: string,
	port: string,
	records: object
) {
	try {
		const keys = Object.keys(records);
		const rows = Object.values(records);
		// let query = parse_query(keys, rows, table);
		// query = query.replace('DELETE FROM', 'SELECT * FROM');
		if (port == null) throw new Error('Invalid port');
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db, // default db
			username: user,
			password: pass
		});
		const query_where = parse_query_postgres(keys, rows);
		const rows_raw = await sql`select * from ${sql(table)} ${sql(query_where)};`;
		return rows_raw;
	} catch (error) {
		console.error(error);
	}
}
