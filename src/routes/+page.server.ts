import process from 'process';
import { redirect } from '@sveltejs/kit';
import { decrypt } from '$lib/crypto/aes';
import { get_mysql_version } from '$lib/db/mysql/version';
import { get_mssql_version } from '$lib/db/mssql/version';
import { create_db_mysql } from '$lib/db/mysql/database';
import { create_db_mssql } from '$lib/db/mssql/database';
import { get_postgres_version } from '$lib/db/postgres/version';
import { create_db_postgres } from '$lib/db/postgres/database';
import { Logger } from '$lib/db/helper/helper';

const logger = new Logger();

/** @type {import('./$types').PageLoad} */
export async function load({ cookies }) {
	const pass = decrypt(cookies.get('pass'));
	const user = decrypt(cookies.get('user'));
	let ip = decrypt(cookies.get('ip'));
	const type = decrypt(cookies.get('type')); // type of db
	let port = ip?.split(':')[1];
	ip = ip?.split(':')[0];

	let version = ''; // version  of DB
	if (user == null || pass == null || ip == null || type == null) {
		throw redirect(301, '/login');
	}

	try {
		if (type == 'MySql') {
			if (port == null) {
				port = '3306';
			}
			version = await get_mysql_version(ip, user, pass, port);
		} else if (type == 'MSSQL') {
			version = await get_mssql_version(ip, user, pass, port);
		} else if (type == 'PostgreSQL') {
			if (port == null) port = '5432';
			version = await get_postgres_version(ip, user, pass, port);
		}

		return {
			success: true,
			version: process.version, // Node js Version
			os: process.platform, // OS where NodeMyAdmin is running
			db: {
				// Info to login on db
				user: user,
				pass: pass,
				ip: ip,
				type: type,
				version: version
			}
		};
	} catch (error) {
		logger.Error(error);
		return { success: false };
	}
}

export const actions = {
	db: async ({ request }) => {
		const db_info = await request.formData();
		const db = db_info.get('db'); // Get db name
		throw redirect(302, '/db_overview?db=' + db); // Go to db overview based on db saves on cookies
	},
	create: async ({ cookies, request }) => {
		const form = await request.formData();
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		let ip = decrypt(cookies.get('ip'));
		const type = decrypt(cookies.get('type'));
		let port = ip?.split(':')[1];
		ip = ip?.split(':')[0];

		try {
			if (type == 'MySql') {
				if (port == null) {
					port = '3306';
				}
				await create_db_mysql(ip, user, pass, form.get('db'), port);
			} else if (type == 'MSSQL') {
				await create_db_mssql(ip, user, pass, form.get('db'), port);
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = '5432';
				}
				await create_db_postgres(ip, user, pass, port, form.get('db'));
			}
			return { success: true };
		} catch (error) {
			logger.Error(error);
			return { success: false };
		}
	},
	logout: async ({ cookies }) => {
		cookies.delete('user'); // Delete all login cookies
		cookies.delete('pass');
		cookies.delete('ip');
		cookies.delete('type');
		throw redirect(302, '/login');
	}
};
