import mysql from 'mysql2/promise';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutLoad} */
export async function load({ request, cookies }) {
	const pass = cookies.get('pass');
	const user = cookies.get('user');
	const ip = cookies.get('ip');
	const type = cookies.get('type');

	const tables: Array<string> = []; // The tables in database

	if (user == null || pass == null || ip == null || type == null) {
		throw redirect(301, '/login');
	}

	try {
		const url = request.url;
		const params = url.split('?')[1];
		let db = params.split('=')[1];

		if(db == null)	// we need this during the query of all records
			db = "sys";

		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: db,
			password: pass
		});

		// get version
		const [tables_raw] = await connection.query('SHOW TABLES;');

		Array.from(tables_raw).forEach((table) => tables.push(Object.values(table)[0]));

		return { db: db, tables: tables };
	} catch (error) {
		console.error(error);
		return '';
	}
}

export const actions = {
	records: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const db = form_data.get("db");
		const table = form_data.get("table");
		const pass = cookies.get('pass');
		const user = cookies.get('user');
		const ip = cookies.get('ip');

		const cols: Array<unknown> = [];
		const rows: Array<string> = [];
		const query = 'SELECT * FROM ' + table;
		
		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});
	
			// get version
			const [records, cols_raw] = await connection.query(query);
			
			for(let i = 0; i < records.length; i++) {
				rows.push(records[i]);
			}

			// Array.from(records).forEach(record => rows.push(record.PK_Token));
			Array.from(cols_raw).forEach(col => cols.push(col.name));
			
			return { records: rows, cols: cols, selected: table, query: query, type: "records" };
		} catch (error) {
			console.error(error);
			return '';
		}
    },
	struct: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const db = form_data.get("db");
		const table = form_data.get("table");
		const pass = cookies.get('pass');
		const user = cookies.get('user');
		const ip = cookies.get('ip');

		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});

			// get version
			const [fields] = await connection.query('SHOW FIELDS FROM ' + table);

			return { cols: fields, selected: table, type: "struct", db: db};
		} catch (error) {
			console.error(error);
			return '';
		}	
	},
	delete: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const db = form_data.get("db");
		const table = form_data.get("table");
		const pass = cookies.get('pass');
		const user = cookies.get('user');
		const ip = cookies.get('ip');
		const col = form_data.get('col');
		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: db,
				password: pass
			});

			await connection.query('ALTER TABLE ' + table + " DROP COLUMN " + col);

			return { success: true };
		} catch (error) {
			console.error(error);
			return { success: false, error: error};
		}	
	}
}