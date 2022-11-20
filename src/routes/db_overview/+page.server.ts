import mysql from 'mysql2/promise';
import { redirect } from '@sveltejs/kit';
import { decrypt } from '$lib/crypto/aes';
import { create_table_mysql, delete_field_mysql, drop_table_mysql, get_all_tables_mysql, search_in_table_mysql, truncate_table_mysql } from '$lib/db/mysql/table';
import { create_table_mssql, delete_field_mssql, drop_table_mssql, get_all_tables_mssql, search_in_table_mssql, truncate_table_mssql } from '$lib/db/mssql/table';
import { add_record_mysql, records_mysql, struct_mysql } from '$lib/db/mysql/record';
import { add_record_mssql, records_mssql, struct_mssql } from '$lib/db/mssql/record';

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

		if (db == null && type == "MySql")
			// if for some reason the db is null we use the default db
			db = 'sys';
		else if (type == "MSSQL" && db == null)
			db = 'master';

		if (type == "MySql") {
			return { db: db, tables: get_all_tables_mysql(ip, user, pass, db) };
		} else if (type == "MSSQL") {
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
		const type = decrypt(cookies.get('type'));

		try {
			if(type == "MySql"){
				const rows = await records_mysql(ip, user, pass, db, table);
				return {
					success: true,
					records: rows.cols.map((row) => {
						return {
							name: row['name'],
							type: row['columnType']
						};
					})
				};
			}else if(type == "MSSQL"){
				const rows = await struct_mssql(ip, user, pass, db, table);
				return {
					success: true,
					records: rows.map((row) =>{
						return {
							name: row['Field'],
                            type: row['Type']
						};
					})
				};
			}
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
		const type = decrypt(cookies.get('type'));


		try {
			if (type == "MySql") {
				const result = await records_mysql(ip, user, pass, db, table);
				return {
					records: result.rows,
					cols: result.cols,
					selected: table,
					query: 'SELECT * FROM ' + table,
					type: 'records',
					db: db
				};
			} else if (type == "MSSQL") {
				let result = await records_mssql(ip, user, pass, db, table);
				if(result[0] == null) {
					result = [{}];
				}
				return {
					records: result,
					cols: Object.keys(result[0]),	// We take the first element since is always the same
					selected: table,
					query: 'SELECT * FROM ' + table,
					type: 'records',
					db: db
				};
			}

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
		const type = decrypt(cookies.get('type'));

		try {
			if (type == "MySql") {
				return { cols: await struct_mysql(ip, user, pass, db, table), selected: table, type: 'struct', db: db };
			} else if (type == "MSSQL") {
				return { cols: await struct_mssql(ip, user, pass, db, table), selected: table, type: 'struct', db: db };
			}
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
		const type = decrypt(cookies.get('type'));

		try {
			if (type == "MySql") {
				await delete_field_mysql(ip, user, pass, db, table, col);
			} else if (type == "MSSQL") {
				await delete_field_mssql(ip, user, pass, db, table, col);
			}
			console.log("OK")
			return { success: true, type: 'delete' };
		} catch (error) {
			console.error(error);
			return { success: false, error: error.message };
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
		const type = decrypt(cookies.get('type'));

		try {
			if(type == "MySql"){
				await add_record_mysql(ip, user, pass, db, table, records);
			}else if(type == "MSSQL") {
				await add_record_mssql(ip, user, pass, db, table, JSON.parse(records));
			}
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
		const type = decrypt(cookies.get('type'));

		try {
			if (type == "MySql") {
				await truncate_table_mysql(ip, user, pass, db, table);
			} else if (type == "MSSQL") {
				await truncate_table_mssql(ip, user, pass, db, table);
			}
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
		const type = decrypt(cookies.get('type'));

		try {
			if (type == 'MySql') {
				await drop_table_mysql(ip, user, pass, db, table);
			} else if (type == 'MSSQL') {
				await drop_table_mssql(ip, user, pass, db, table);
			}
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
		const type = decrypt(cookies.get('type'));

		try {
			if(type == "MySql") {
				return { success: true, type: 'search', rows: JSON.stringify(await search_in_table_mysql(ip, user, pass, db, table, JSON.parse(records))) };
			}else if(type == "MSSQL") {
				return { success: true, type:'search', rows: JSON.stringify(await search_in_table_mssql(ip, user, pass, db, table, JSON.parse(records))) };
			}
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
			if (type == "MySql")
				create_table_mysql(ip, user, pass, form.get('db'), form.get("table"), fields);
			else if (type == "MSSQL")
				create_table_mssql(ip, user, pass, form.get('db'), form.get("table"), fields);

			return { success: true, type: 'create' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			return { success: false, error: error.code, error_message: error.sqlMessage, type: 'search' };
		}
	}
};
