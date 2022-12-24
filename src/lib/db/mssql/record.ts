import mssql from 'mssql';

export async function records_mssql(
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
		const records = await mssql.query('SELECT * FROM ' + db + '.dbo.' + table);
		return records.recordset;
	} catch (err) {
		throw err;
	}
}

export async function add_record_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	table: string,
	records: object,
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
		const cols = Object.keys(records).join(','); // Cols of table
		const values = Object.values(records)
			.map((value) => {
				if (typeof value == 'string') {
					// If value is a string we need to add quotes to avoid errors
					return "'" + value + "'";
				} else {
					return value;
				}
			})
			.join(','); // Row of table to insert
		await mssql.query(`INSERT INTO ${db}.dbo.${table} (${cols}) VALUES (${values})`);
	} catch (err) {
		throw err;
	}
}

export async function delete_record_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	table: string,
	query: string,
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
		await mssql.query(query.replace(table, `${db}.dbo.${table}`));
	} catch (err) {
		throw err;
	}
}

export async function update_record_mssql(
	ip: string,
	user: string,
	password: string,
	db: string,
	table: string,
	query: string,
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
		await mssql.query(query.replace(table, `${db}.dbo.${table}`));
	} catch (err) {
		throw err;
	}
}
