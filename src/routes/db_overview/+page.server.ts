import { redirect } from '@sveltejs/kit';
import { decrypt } from '$lib/crypto/aes';
import {
	create_table_mysql,
	delete_field_mysql,
	drop_table_mysql,
	get_all_tables_mysql,
	search_in_table_mysql,
	truncate_table_mysql
} from '$lib/db/mysql/table';
import {
	create_table_mssql,
	delete_field_mssql,
	drop_table_mssql,
	get_all_tables_mssql,
	search_in_table_mssql,
	struct_mssql,
	truncate_table_mssql
} from '$lib/db/mssql/table';
import {
	add_record_mysql,
	delete_record_mysql,
	records_mysql,
	struct_mysql,
	update_record_mysql
} from '$lib/db/mysql/record';
import {
	add_record_mssql,
	delete_record_mssql,
	records_mssql,
	update_record_mssql
} from '$lib/db/mssql/record';
import {
	create_table_postgres,
	delete_field_postgres,
	drop_table_postgres,
	get_all_tables_postgres,
	search_in_table_postgres,
	struct_postgres,
	truncate_table_postgres
} from '$lib/db/postgres/table';
import { parse_query } from '$lib/db/helper/helper';
import { parse_query_update_mysql } from '$lib/db/mysql/helper';
import { parse_query_update_mssql } from '$lib/db/mssql/helper';
import {
	add_record_postgres,
	delete_record_postgres,
	records_postgres,
	update_record_postgres
} from '$lib/db/postgres/records';
import { parse_query_postgres, parse_query_update_postgres } from '$lib/db/postgres/helper';

/** @type {import('./$types').LayoutLoad} */
export async function load({ request, cookies }) {
	const pass = decrypt(cookies.get('pass'));
	const user = decrypt(cookies.get('user'));
	let ip = decrypt(cookies.get('ip'));
	const type = decrypt(cookies.get('type'));
	let port = ip?.split(':')[1];
	ip = ip.split(':')[0];

	if (user == null || pass == null || ip == null || type == null) {
		throw redirect(301, '/login'); // Not logged in
	}

	try {
		const url = request.url;
		const params = url.split('?')[1];
		let db = params.split('=')[1];

		if (db == null && type == 'MySql')
			// if for some reason the db is null we use the default db
			db = 'sys';
		else if (type == 'MSSQL' && db == null) db = 'master';
		else if (type == 'PostgreSQL' && db == null) db = 'postgres';

		if (type == 'MySql') {
			return { db: db, tables: get_all_tables_mysql(ip, user, pass, db, port) };
		} else if (type == 'MSSQL') {
			return { db: db, tables: get_all_tables_mssql(ip, user, pass, db, port) };
		} else if (type == 'PostgreSQL') {
			return { db: db, tables: await get_all_tables_postgres(ip, user, pass, port, db) };
		}
	} catch (error) {
		console.error(error);
		return { error: error };
	}
}

export const actions = {
	rows: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const db = form_data.get('db');
		const table = form_data.get('table');
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		let ip = decrypt(cookies.get('ip'));
		const type = decrypt(cookies.get('type'));
		let port = ip?.split(':')[1];
		ip = ip.split(':')[0];

		try {
			if (type == 'MySql') {
				const rows = await records_mysql(ip, user, pass, db, table, port);
				return {
					success: true,
					records: rows.cols_raw.map((row) => {
						return {
							name: row['name'],
							type: row['columnType']
						};
					})
				};
			} else if (type == 'MSSQL') {
				const rows = await struct_mssql(ip, user, pass, db, table, port);
				return {
					success: true,
					records: rows.map((row) => {
						return {
							name: row['Field'],
							type: row['Type']
						};
					})
				};
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				const rows = await struct_postgres(ip, user, pass, port, db, table);
				return {
					success: true,
					records: rows.map((row) => {
						return {
							name: row['Field'],
							type: row['type_id']
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
		let ip = decrypt(cookies.get('ip'));
		const type = decrypt(cookies.get('type'));
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];

		try {
			if (type == 'MySql') {
				const result = await records_mysql(ip, user, pass, db, table, port);
				return {
					records: result.rows,
					cols: result.cols,
					selected: table,
					query: 'SELECT * FROM ' + table,
					type: 'records',
					db: db
				};
			} else if (type == 'MSSQL') {
				let result = await records_mssql(ip, user, pass, db, table, port);
				if (result[0] == null) {
					result = [{}];
				}
				return {
					records: result,
					cols: Object.keys(result[0]), // We take the first element since is always the same
					selected: table,
					query: 'SELECT * FROM ' + table,
					type: 'records',
					db: db
				};
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				let result = await records_postgres(ip, user, pass, port, db, table);
				return {
					records: result.rows,
					cols: result.cols, // We take the first element since is always the same
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
		let ip = decrypt(cookies.get('ip'));
		const type = decrypt(cookies.get('type'));
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];

		try {
			if (type == 'MySql') {
				return {
					cols: await struct_mysql(ip, user, pass, db, table, port),
					selected: table,
					type: 'struct',
					db: db
				};
			} else if (type == 'MSSQL') {
				return {
					cols: await struct_mssql(ip, user, pass, db, table, port),
					selected: table,
					type: 'struct',
					db: db
				};
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				return {
					cols: await struct_postgres(ip, user, pass, port, db, table),
					selected: table,
					type: 'struct',
					db: db
				};
			}
		} catch (error) {
			console.error(error);
			return { success: false, error: error };
		}
	},
	delete: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const db = form_data.get('db');
		const table = form_data.get('table');
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		let ip = decrypt(cookies.get('ip'));
		const type = decrypt(cookies.get('type'));
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];
		const col = form_data.get('col');

		try {
			if (type == 'MySql') {
				await delete_field_mysql(ip, user, pass, db, table, col, port);
			} else if (type == 'MSSQL') {
				await delete_field_mssql(ip, user, pass, db, table, col, port);
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				await delete_field_postgres(ip, user, pass, port, db, table, col);
			}
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
		let ip = decrypt(cookies.get('ip'));
		const type = decrypt(cookies.get('type'));
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];
		const db = form_data.get('db');

		const keys = Object.keys(values_raw[index]);
		const rows = Object.values(values_raw[index]);

		try {
			if (type == 'MySql') {
				const query = parse_query(keys, rows, table);
				await delete_record_mysql(ip, user, pass, db, query, port);
			} else if (type == 'MSSQL') {
				const query = parse_query(keys, rows, table);
				await delete_record_mssql(ip, user, pass, db, table, query, port);
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				await delete_record_postgres(ip, user, pass, port, db, table, keys, rows);
			}
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
		let ip = decrypt(cookies.get('ip'));
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];
		const db = form.get('db');
		const table = form.get('table');
		const old_table = form.get('old_db');
		const type = decrypt(cookies.get('type'));

		const keys = Object.keys(JSON.parse(values));
		const rows = Object.values(JSON.parse(values));
		const old_keys = Object.keys(JSON.parse(old_table));
		const old_rows = Object.values(JSON.parse(old_table));

		try {
			if (type == 'MySql') {
				const query =
					parse_query_update_mysql(keys, rows, table) +
					parse_query(old_keys, old_rows, table).replace('DELETE FROM ' + table, '');

				await update_record_mysql(ip, user, pass, db, query, port);
			} else if (type == 'MSSQL') {
				const query =
					parse_query_update_mssql(keys, rows, table) +
					parse_query(old_keys, old_rows, table).replace('DELETE FROM ' + table, '');

				await update_record_mssql(ip, user, pass, db, table, query, port);
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				await update_record_postgres(
					ip,
					user,
					pass,
					port,
					db,
					table,
					keys,
					rows,
					old_keys,
					old_rows
				);
			}
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
		let ip = decrypt(cookies.get('ip'));
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];
		const form = await request.formData();
		const db = form.get('db');
		const table = form.get('table');
		const records = form.get('records');
		const type = decrypt(cookies.get('type'));

		try {
			if (type == 'MySql') {
				await add_record_mysql(ip, user, pass, db, table, records, port);
			} else if (type == 'MSSQL') {
				await add_record_mssql(ip, user, pass, db, table, JSON.parse(records), port);
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				await add_record_postgres(ip, user, pass, port, db, table, JSON.parse(records));
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
		let ip = decrypt(cookies.get('ip'));
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];
		const form = await request.formData();
		const db = form.get('db');
		const table = form.get('table');
		const type = decrypt(cookies.get('type'));

		try {
			if (type == 'MySql') {
				await truncate_table_mysql(ip, user, pass, db, table, port);
			} else if (type == 'MSSQL') {
				await truncate_table_mssql(ip, user, pass, db, table, port);
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				await truncate_table_postgres(ip, user, pass, port, db, table);
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
		let ip = decrypt(cookies.get('ip'));
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];
		const form = await request.formData();
		const db = form.get('db');
		const table = form.get('table');
		const type = decrypt(cookies.get('type'));

		try {
			if (type == 'MySql') {
				await drop_table_mysql(ip, user, pass, db, table, port);
			} else if (type == 'MSSQL') {
				await drop_table_mssql(ip, user, pass, db, table, port);
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				await drop_table_postgres(ip, user, pass, port, db, table);
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
		let ip = decrypt(cookies.get('ip'));
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];
		const form = await request.formData();
		const db = form.get('db');
		const table = form.get('table');
		const records = form.get('records');
		const type = decrypt(cookies.get('type'));

		try {
			if (type == 'MySql') {
				return {
					success: true,
					type: 'search',
					rows: JSON.stringify(
						await search_in_table_mysql(ip, user, pass, db, table, JSON.parse(records), port)
					)
				};
			} else if (type == 'MSSQL') {
				return {
					success: true,
					type: 'search',
					rows: JSON.stringify(
						await search_in_table_mssql(ip, user, pass, db, table, JSON.parse(records), port)
					)
				};
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				return {
					success: true,
					type: 'search',
					rows: JSON.stringify(
						await search_in_table_postgres(ip, user, pass, db, table, port, JSON.parse(records))
					)
				};
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
		let ip = decrypt(cookies.get('ip'));
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];
		const fields = JSON.parse(form.get('fields'));
		const type = decrypt(cookies.get('type'));
		const db = form.get('db');
		const table = form.get('table');

		try {
			if (type == 'MySql') {
				create_table_mysql(ip, user, pass, db, table, fields, port);
			} else if (type == 'MSSQL') create_table_mssql(ip, user, pass, db, table, fields, port);
			else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				create_table_postgres(ip, user, pass, port, db, table, fields);
			}
			return { success: true, type: 'create' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			return { success: false, error: error.code, error_message: error.sqlMessage, type: 'search' };
		}
	}
};
