import mssql from 'mssql';
import { parse_query } from '../helper/helper';

export async function get_all_tables_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	port: string
): Promise<string> {
	if (port == null) port = '1433';
	const sqlConfig = {
		user: user,
		password: password,
		database: db, // this is the default database
		server: ip,
		port: port,
		pool: {
			max: 1,
			min: 0,
			idleTimeoutMillis: 30000
		},
		options: {
			encrypt: true, // for azure
			trustServerCertificate: true // change to true for local dev / self-signed certs
		}
	};
	try {
		// make sure that any items are correctly URL encoded in the connection string
		await mssql.connect(sqlConfig);
		const result = await mssql.query('SELECT * FROM ' + db + '.sys.Tables');
		const tables = result.recordset.map((table: { name: any }) => {
			return table.name;
		});
		return tables;
	} catch (err) {
		throw err;
	}
}

export async function create_table_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	table: string,
	fields: Array<string>,
	port: string
) {
	if (port == null) port = '1433';
	const sqlConfig = {
		user: user,
		password: password,
		database: db, // this is the default database
		server: ip,
		port: port,
		pool: {
			max: 1,
			min: 0,
			idleTimeoutMillis: 30000
		},
		options: {
			encrypt: true, // for azure
			trustServerCertificate: true // change to true for local dev / self-signed certs
		}
	};
	try {
		let query = 'CREATE TABLE ' + db + '.dbo.' + table + ' (';
		fields.forEach((field) => (query += field + ','));
		query = query.slice(0, -1) + '';
		query += ')';
		// make sure that any items are correctly URL encoded in the connection string
		await mssql.connect(sqlConfig);
		await mssql.query(query);
	} catch (err) {
		throw err;
	}
}

export async function drop_table_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	table: string,
	port: string
) {
	if (port == null) port = '1433';
	const sqlConfig = {
		user: user,
		password: password,
		database: db, // this is the default database
		server: ip,
		port: port,
		pool: {
			max: 1,
			min: 0,
			idleTimeoutMillis: 30000
		},
		options: {
			encrypt: true, // for azure
			trustServerCertificate: true // change to true for local dev / self-signed certs
		}
	};
	try {
		// make sure that any items are correctly URL encoded in the connection string
		await mssql.connect(sqlConfig);
		await mssql.query('DROP TABLE ' + db + '.dbo.' + table);
	} catch (err) {
		throw err;
	}
}

export async function truncate_table_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	table: string,
	port: string
) {
	if (port == null) port = '1433';
	const sqlConfig = {
		user: user,
		password: password,
		database: db, // this is the default database
		server: ip,
		port: port,
		pool: {
			max: 1,
			min: 0,
			idleTimeoutMillis: 30000
		},
		options: {
			encrypt: true, // for azure
			trustServerCertificate: true // change to true for local dev / self-signed certs
		}
	};
	try {
		// make sure that any items are correctly URL encoded in the connection string
		await mssql.connect(sqlConfig);
		await mssql.query('TRUNCATE TABLE ' + db + '.dbo.' + table);
	} catch (err) {
		throw err;
	}
}

export async function delete_field_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	table: string,
	col: string,
	port: string
) {
	if (port == null) port = '1433';
	const sqlConfig = {
		user: user,
		password: password,
		database: db, // this is the default database
		server: ip,
		port: port,
		pool: {
			max: 1,
			min: 0,
			idleTimeoutMillis: 30000
		},
		options: {
			encrypt: true, // for azure
			trustServerCertificate: true // change to true for local dev / self-signed certs
		}
	};
	try {
		// make sure that any items are correctly URL encoded in the connection string
		await mssql.connect(sqlConfig);
		await mssql.query('ALTER TABLE ' + db + '.dbo.' + table + ' DROP COLUMN ' + col);
	} catch (err) {
		throw err;
	}
}

export async function search_in_table_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	table: string,
	records: object,
	port: string
) {
	try {
		if (port == null) port = '1433';
		const keys = Object.keys(records);
		const rows = Object.values(records);
		let query = parse_query(keys, rows, table);
		query = query.replace('DELETE FROM', 'SELECT * FROM');
		const sqlConfig = {
			user: user,
			password: password,
			database: db, // this is the default database
			server: ip,
			port: port,
			pool: {
				max: 1,
				min: 0,
				idleTimeoutMillis: 30000
			},
			options: {
				encrypt: true, // for azure
				trustServerCertificate: true // change to true for local dev / self-signed certs
			}
		};
		await mssql.connect(sqlConfig);
		const result = await mssql.query(query);
		return result.recordset;
	} catch (err) {
		throw err;
	}
}

export async function struct_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	table: string,
	port: string
) {
	if (port == null) port = '1433';
	const sqlConfig = {
		user: user,
		password: password,
		database: db, // this is the default database
		server: ip,
		port: port,
		pool: {
			max: 1,
			min: 0,
			idleTimeoutMillis: 30000
		},
		options: {
			encrypt: true, // for azure
			trustServerCertificate: true // change to true for local dev / self-signed certs
		}
	};
	try {
		const cols = [];
		// make sure that any items are correctly URL encoded in the connection string
		await mssql.connect(sqlConfig);
		const records = await mssql.query(
			"SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('" + table + "')"
		);
		const cols_raw = records.recordset;
		cols_raw.forEach((col: { name: any; system_type_id: any; is_nullable: any }) => {
			cols.push({
				Field: col.name,
				Type: col.system_type_id,
				Key: '', // We don't have this property in this query in MSSQL
				Null: col.is_nullable,
				Default: '',
				Extra: ''
			});
		});
		return cols;
	} catch (err) {
		throw err;
	}
}
