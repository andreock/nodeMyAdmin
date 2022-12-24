import mssql from 'mssql';
import type { Database } from 'src/app';

export async function get_all_dbs_mssql(
	ip: string,
	user: string,
	password: string,
	port: string
): Promise<Array<string>> {
	if (port == null) port = '1433';
	const sqlConfig = {
		user: user,
		password: password,
		database: 'master', // this is the default database
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
		const result = await mssql.query`SELECT name FROM master.dbo.sysdatabases`;
		return result.recordset.map((x: Database) => x.name);
	} catch (err) {
		throw err;
	}
}

export async function create_db_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	port: string
) {
	if (port == null) port = '1433';
	const sqlConfig = {
		user: user,
		password: password,
		database: 'master', // this is the default database
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
		await mssql.query('CREATE DATABASE ' + db);
	} catch (err) {
		throw err;
	}
}
