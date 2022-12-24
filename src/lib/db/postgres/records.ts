import postgres from 'postgres';
import { parse_query_postgres } from './helper';

export async function records_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined,
	db: string | undefined,
	table: string
) {
	if (port == null) throw new Error('Invalid port');
	try {
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db, // default db
			username: user,
			password: pass
		});
		const tables = await sql`SELECT * FROM ${sql(table)};`;
		sql.end();
		if (tables.length != 0)
			return {
				cols: Object.keys(tables[0]),
				rows: Object.values(tables)
			};
		else
			return {
				cols: [],
				rows: []
			};
	} catch (error) {
		throw error;
	}
}

export async function delete_record_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined,
	db: string | undefined,
	table: string,
	keys: Array<string>,
	rows: Array<string>
): Promise<void> {
	try {
		if (port == null) throw new Error('Invalid port');
		console.error('DELETE RECORD IS BROKEN AND IS NOT IMPLEMENTED CURRENTLY');
		return;
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db, // default db
			username: user,
			password: pass
		});
		const query_where = parse_query_postgres(keys, rows);
		await sql`delete from ${sql(table)} ${sql(query_where)};`;
		sql.end();
	} catch (error) {
		throw error;
	}
}

export async function add_record_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined,
	db: string | undefined,
	table: string,
	records: string
) {
	if (port == null) throw new Error('Invalid port');
	try {
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db, // default db
			username: user,
			password: pass
		});
		await sql`insert into ${sql(table)} ${sql(records)}`;
		sql.end();
	} catch (error) {
		throw error;
	}
}

export async function update_record_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined,
	db: string | undefined,
	table: string,
	keys: Array<string>,
	rows: Array<string>,
	old_keys: Array<string>,
	old_rows: Array<string>
) {
	if (port == null) throw new Error('Invalid port');
	try {
		const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/${db}`, {
			host: ip,
			port: parseInt(port),
			database: db, // default db
			username: user,
			password: pass
		});
		let new_record: any = {};
		keys.forEach(function callback(key, i) {
			new_record[key] = rows[i];
		});
		const query_where = parse_query_postgres(old_keys, old_rows).replace('where ', '');
		const result = await sql`update ${sql(table)} set ${sql(new_record)} where ${query_where}`;
		sql.end();
	} catch (error) {
		throw error;
	}
}
