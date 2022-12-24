import mysql from 'mysql2/promise';

export async function records_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	table: string,
	port: string
) {
	try {
		if(port == null) port = "3306";
		const cols: Array<unknown> = [];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const rows: Array<any> = [];

		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});

		// get version
		const [records, cols_raw] = await connection.query('SELECT * FROM ' + table);
		if (records instanceof Array)
			// Get all records
			for (let i = 0; i < records.length; i++) {
				rows.push(records[i]);
			}

		Array.from(cols_raw).forEach((col) => cols.push(col.name));
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
		return { cols: cols, rows: rows, cols_raw: cols_raw };
	} catch (error) {
		throw error;
	}
}

export async function struct_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	table: string,
	port: string
) {
	try {
		if(port == null) port = "3306";
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});

		// get version
		const [fields] = await connection.query('SHOW FIELDS FROM ' + table);
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
		return fields;
	} catch (error) {
		throw error;
	}
}

export async function add_record_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	table: string,
	records: string,
	port: string
) {
	try {
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});
		await connection.query('INSERT INTO ' + table + ' SET ?', JSON.parse(records));
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
	} catch (error) {
		throw error;
	}
}

export async function delete_record_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	query: string,
	port: string
) {
	try {
		if(port == null) port = "3306";
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});

		await connection.query(query);
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
	} catch (error) {
		throw error;
	}
}

export async function update_record_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	query: string,
	port: string
) {
	try {
		if(port == null) port = "3306";
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});

		await connection.query(query);
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
	} catch (error) {
		throw error;
	}
}
