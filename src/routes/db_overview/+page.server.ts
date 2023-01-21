import { redirect } from '@sveltejs/kit';
import { Server } from '$lib/server_side_handler/server';
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

const handler = new Server();

/** @type {import('./$types').LayoutLoad} */
export async function load({ request, cookies }) {

	const pass = decrypt(cookies.get('pass'));
	const user = decrypt(cookies.get('user'));
	let ip: string | null | undefined = decrypt(cookies.get('ip'));
	const type = decrypt(cookies.get('type'));
	let port = ip?.split(':')[1];
	ip = ip?.split(':')[0];

	if (user == null || pass == null || ip == null || type == null) {
		throw redirect(301, '/login'); // Not logged in
	}

	if (port == null && type == 'MySql') port = "3306";					// if we use default port define that
	else if (type == 'MSSQL' && port == null) port = "1433";
	else if (type == 'PostgreSQL' && port == null) port = "5432";

	handler.CreateServer(user, pass, ip, port,type);

	const url = request.url;
	const params = url.split('?')[1];
	let db = params.split('=')[1];

	if (db == null && type == 'MySql') db = 'sys';					// if for some reason the db is null we use the default db
	else if (type == 'MSSQL' && db == null) db = 'master';
	else if (type == 'PostgreSQL' && db == null) db = 'postgres';

	handler.ChangeDB(db);

	return handler.GetAllTables();
}

export const actions = {

	rows: async ({ request }) => {
		const form_data = await request.formData();
		const table = form_data.get('table');

		return handler.Rows(table);
	},

	records: async ({ request }) => {
		const form_data = await request.formData();
		const table = form_data.get('table');

		return handler.Records(table);
	},
	
	struct: async ({ request }) => {
		const form_data = await request.formData();
		const table = form_data.get('table');

		return handler.Struct(table);
	},

	delete: async ({ request }) => {
		const form_data = await request.formData();
		const table = form_data.get('table');
		const col = form_data.get('col');

		return handler.Delete(table, col);
	},

	delete_record: async ({ request }) => {
		const form_data = await request.formData();
		const values_raw = JSON.parse(form_data.get('values'));
		const table = form_data.get('table');
		const index = form_data.get('index');
		
		const keys = Object.keys(values_raw[index]);
		const rows = Object.values(values_raw[index]);
		return handler.DeleteRecord(table, keys, rows);
	},
	update: async ({ request }) => {
		const form = await request.formData();
		const values = form.get('values');
		const table = form.get('table');
		const old_table = form.get('old_db');

		// Parse new and old values
		const keys = Object.keys(JSON.parse(values));
		const rows = Object.values(JSON.parse(values));
		const old_keys = Object.keys(JSON.parse(old_table));
		const old_rows = Object.values(JSON.parse(old_table));

		return handler.Update(table, keys, rows, old_keys, old_rows);
	},
	add: async ({ request }) => {
		const form = await request.formData();
		const table = form.get('table');
		const records = form.get('records');

		return handler.Add(table, records);
	},
	truncate: async ({ request }) => {
		const form = await request.formData();
		const table = form.get('table');

		return handler.Truncate(table);
	},
	drop: async ({ request }) => {
		const form = await request.formData();
		const table = form.get('table');

		return handler.Drop(table);
	},
	search: async ({ request }) => {
		const form = await request.formData();
		const table = form.get('table');
		const records = form.get('records');

		return handler.Search(table, records);
	},
	create: async ({ request }) => {
		const form = await request.formData();
		const fields = JSON.parse(form.get('fields'));
		const table = form.get('table');

		return handler.Create(table, fields);
	}
};
