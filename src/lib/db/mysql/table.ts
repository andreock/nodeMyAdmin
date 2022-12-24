import mysql from 'mysql2/promise';
import { parse_query } from '../helper/helper';

export async function get_all_tables_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	port: string
) {
	try {
		if (port == null) port = '3306';
		const tables: Array<string> = []; // The tables in database
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});

		// get version
		const [tables_raw] = await connection.query('SHOW TABLES;');

		Array.from(tables_raw).forEach((table) => tables.push(Object.values(table)[0])); // Get all tables in a db
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
		return tables;
	} catch (error) {
		throw error;
	}
}

export async function create_table_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	table: string,
	fields: Array<string>,
	port: string
) {
	try {
		if (port == null) port = '3306';
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});
		let query = 'CREATE TABLE ' + table + ' (';
		fields.forEach((field) => (query += field + ','));
		query = query.slice(0, -1) + '';
		query += ')';
		await connection.query(query);
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
	} catch (error) {
		throw error;
	}
}

export async function drop_table_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	table: string,
	port: string
) {
	try {
		if (port == null) port = '3306';
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});
		await connection.query('DROP TABLE ' + table);
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
	} catch (error) {
		throw error;
	}
}

export async function delete_field_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	table: string,
	col: string,
	port: string
) {
	try {
		if (port == null) port = '3306';
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});

		await connection.query('ALTER TABLE ' + table + ' DROP COLUMN ' + col); // Drop a column in a table
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
	} catch (error) {
		throw error;
	}
}

export async function truncate_table_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	table: string,
	port: string
) {
	try {
		if (port == null) port = '3306';
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});
		await connection.query('TRUNCATE TABLE ' + table);
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
	} catch (error) {
		throw error;
	}
}

export async function search_in_table_mysql(
	ip: string,
	user: string,
	pass: string,
	db: string,
	table: string,
	records: object,
	port: string
) {
	try {
		if (port == null) port = '3306';
		const keys = Object.keys(records);
		const rows = Object.values(records);
		let query = parse_query(keys, rows, table);
		query = query.replace('DELETE FROM', 'SELECT * FROM');
		console.log(query);
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass,
			port: parseInt(port)
		});
		const [rows_from_db] = await connection.query(query);
		connection.destroy(); // We need to close the connection to prevent saturation of max connections
		return rows_from_db;
	} catch (error) {}
}
