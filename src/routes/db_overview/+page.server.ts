import mysql from 'mysql2/promise';
import { redirect } from '@sveltejs/kit';
import { decrypt } from '$lib/crypto/aes';
import { create_table_mysql, get_all_tables_mysql } from '$lib/db/mysql/table';
import { create_table_mssql, get_all_tables_mssql } from '$lib/db/mssql/table';

/** @type {import('./$types').LayoutLoad} */
export async function load({ request, cookies }) {
	const pass = decrypt(cookies.get('pass'));
	const user = decrypt(cookies.get('user'));
	const ip = decrypt(cookies.get('ip'));
	const type = decrypt(cookies.get('type'));


	if (user == null || pass == null || ip == null || type == null) {
		throw redirect(301, '/login'); // Not logged in
	}

	try {
		const url = request.url;
		const params = url.split('?')[1];
		let db = params.split('=')[1];

		if (db == null)
			// if for some reason the db is null we use the default db
			db = 'sys';
		if(type == "MySql"){
			return { db: db, tables: get_all_tables_mysql(ip, user, pass, db) };
		}else if(type == "MSSQL"){
			return { db: db, tables: get_all_tables_mssql(ip, user, pass, db) };
		}

	} catch (error) {
		console.error(error);
		return { error: error };
	}
}

function parse_query(keys: Array<string>, rows: Array<string | Date | boolean>, table: string) {
	let query = 'DELETE FROM ' + table + ' WHERE (';
	keys.forEach(function callback(key, i) {
		if (typeof rows[i] == 'string' && rows[i].includes('T')) {
			// Is a date, we need to convert it to MySql DateTime
			try {
				rows[i] = '';
			} catch (error) {
				// is not a real date
			}
		}
		if (rows[i] != '' || typeof rows[i] == 'boolean') {
			if (i != keys.length - 1) {
				if (typeof rows[i] != 'boolean')
					query += `${key} = '${rows[i]}' AND `; // The boolean must be written in query without quotes, with quotes became a string and broke the WHERE clause
				else query += `${key} = ${rows[i]} AND `;
			} else {
				if (typeof rows[i] != 'boolean')
					query += `${key} = '${rows[i]}' )`; // The last where don't need AND
				else query += `${key} = ${rows[i]} )`; // The last where don't need AND
			}
		}
	});

	return query;
}

function parse_query_update(
	keys: Array<string>,
	rows: Array<string | Date | boolean>,
	table: string
) {
	let query = 'UPDATE ' + table + ' SET ';
	keys.forEach(function callback(key, i) {
		if (typeof rows[i] == 'string' && rows[i].includes('T')) {
			// Is a date, we need to convert it to MySql DateTime
			try {
				rows[i] = '';
			} catch (error) {
				// is not a real date
			}
		}

		if (i != keys.length - 1 && rows[i] != '') {
			query += '`' + key + '`' + ' = ' + "'" + rows[i] + "',"; // We may need to convert this form to a template string
		} else if (rows[i] != '') {
			// The last where don't need AND
			query += '`' + key + '`' + ' = ' + "'" + rows[i] + "'";
		}
	});

	return query;
}

export const actions = {
	rows: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const db = form_data.get('db');
		const table = form_data.get('table');
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));
		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});

			// get records
			const [x, rows] = await connection.query('SELECT * FROM ' + table); // x in not requred
			connection.destroy(); // We need to close the connection to prevent saturation of max connections
			return {
				success: true,
				records: Array.from(rows).map((row) => {
					return {
						name: row['name'],
						type: row['columnType']
					};
				})
			};
		} catch (error) {
			console.error(error);
			return '';
		}
	},
	records: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const db = form_data.get('db');
		const table = form_data.get('table');
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));

		const cols: Array<unknown> = [];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const rows: Array<any> = [];

		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
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
			return {
				records: rows,
				cols: cols,
				selected: table,
				query: 'SELECT * FROM ' + table,
				type: 'records',
				db: db
			};
		} catch (error) {
			console.error(error);
			return '';
		}
	},
	struct: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const db = form_data.get('db');
		const table = form_data.get('table');
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));

		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});

			// get version
			const [fields] = await connection.query('SHOW FIELDS FROM ' + table);
			connection.destroy(); // We need to close the connection to prevent saturation of max connections
			return { cols: fields, selected: table, type: 'struct', db: db };
		} catch (error) {
			console.error(error);
			return '';
		}
	},
	delete: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const db = form_data.get('db');
		const table = form_data.get('table');
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));
		const col = form_data.get('col');
		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});

			await connection.query('ALTER TABLE ' + table + ' DROP COLUMN ' + col); // Drop a column in a table
			connection.destroy(); // We need to close the connection to prevent saturation of max connections
			return { success: true, type: 'delete' };
		} catch (error) {
			console.error(error);
			return { success: false, error: error };
		}
	},
	delete_record: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const values_raw = JSON.parse(form_data.get('values'));
		const table = form_data.get('table');
		const index = form_data.get('index');
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));
		const db = form_data.get('db');

		const keys = Object.keys(values_raw[index]);
		const rows = Object.values(values_raw[index]);

		const query = parse_query(keys, rows, table);

		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});

			await connection.query(query);
			connection.destroy(); // We need to close the connection to prevent saturation of max connections
			return { success: true, type: 'delete' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			return { success: false, error: error.code, error_message: error.sqlMessage };
		}
	},
	update: async ({ cookies, request }) => {
		const form = await request.formData();
		const values = form.get('values');
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));
		const db = form.get('db');
		const table = form.get('table');
		const old_table = form.get('old_db');

		const keys = Object.keys(JSON.parse(values));
		const rows = Object.values(JSON.parse(values));
		const old_keys = Object.keys(JSON.parse(old_table));
		const old_rows = Object.values(JSON.parse(old_table));

		const query =
			parse_query_update(keys, rows, table) +
			parse_query(old_keys, old_rows, table).replace('DELETE FROM ' + table, '');

		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});
			await connection.query(query);
			connection.destroy(); // We need to close the connection to prevent saturation of max connections
			return { success: true, type: 'update' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			return { success: false, error: error.code, error_message: error.sqlMessage };
		}
	},
	add: async ({ cookies, request }) => {
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));
		const form = await request.formData();
		const db = form.get('db');
		const table = form.get('table');
		const records = form.get('records');
		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});
			await connection.query('INSERT INTO ' + table + ' SET ?', JSON.parse(records));
			connection.destroy(); // We need to close the connection to prevent saturation of max connections
			return { success: true, type: 'add' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			return { success: false, error: error.code, error_message: error.sqlMessage, type: 'add' };
		}
	},
	truncate: async ({ cookies, request }) => {
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));
		const form = await request.formData();
		const db = form.get('db');
		const table = form.get('table');

		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});
			await connection.query('TRUNCATE TABLE ' + table);
			connection.destroy(); // We need to close the connection to prevent saturation of max connections
			return { success: true, type: 'truncate' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			return {
				success: false,
				error: error.code,
				error_message: error.sqlMessage,
				type: 'truncate'
			};
		}
	},
	drop: async ({ cookies, request }) => {
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));
		const form = await request.formData();
		const db = form.get('db');
		const table = form.get('table');

		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});
			await connection.query('DROP TABLE ' + table);
			connection.destroy(); // We need to close the connection to prevent saturation of max connections
			return { success: true, type: 'drop' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			return { success: false, error: error.code, error_message: error.sqlMessage, type: 'drop' };
		}
	},
	search: async ({ cookies, request }) => {
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));
		const form = await request.formData();
		const db = form.get('db');
		const table = form.get('table');
		const records = form.get('records');

		const keys = Object.keys(JSON.parse(records));
		const rows = Object.values(JSON.parse(records));
		let query = parse_query(keys, rows, table);
		query = query.replace('DELETE FROM', 'SELECT * FROM');
		console.log(query);
		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});
			const [rows] = await connection.query(query);
			connection.destroy(); // We need to close the connection to prevent saturation of max connections
			return { success: true, type: 'search', rows: JSON.stringify(rows) };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			return { success: false, error: error.code, error_message: error.sqlMessage, type: 'search' };
		}
	},
	create: async ({ cookies, request }) => {
		const form = await request.formData();
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));
		const fields = JSON.parse(form.get('fields'));
		const type = decrypt(cookies.get('type'));


		try {
			if(type == "MySql")
				create_table_mysql(ip, user, pass, form.get('db'), form.get("table"), fields);
			else if(type == "MSSQL")
				create_table_mssql(ip, user, pass, form.get('db'), form.get("table"), fields);
				
			return { success: true, type: 'create' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			return { success: false, error: error.code, error_message: error.sqlMessage, type: 'search' };
		}
	}
};
