import { decrypt } from '$lib/crypto/aes';
import { get_all_dbs_mysql } from '$lib/db/mysql/database';
import { get_all_dbs_mssql } from '$lib/db/mssql/database';
import { get_all_dbs_postgres } from '$lib/db/postgres/database';
import { Logger } from '$lib/db/helper/helper';

const logger = new Logger();

/** @type {import('./$types').PageLoad} */
export async function load({ params, cookies }) {
	const pass = decrypt(cookies.get('pass'));
	const user = decrypt(cookies.get('user'));
	let ip = decrypt(cookies.get('ip'));
	const type = decrypt(cookies.get('type'));
	let port = ip?.split(':')[1];
	ip = ip?.split(':')[0];

	const databases: Array<string> = [];

	if (user == null || pass == null || ip == null || type == null) {
		return {
			success: true,
			databases: databases
		};
	} else {
		try {
			if (type == 'MySql') {
				if (port == null) {
					port = '3306';
				}
				return {
					success: true,
					databases: await get_all_dbs_mysql(ip, user, pass, port)
				};
			} else if (type == 'MSSQL') {
				return {
					success: true,
					databases: await get_all_dbs_mssql(ip, user, pass, port)
				};
			} else if (type == 'PostgreSQL') {
				if (port == null) port = '5432';
				return {
					success: true,
					databases: await get_all_dbs_postgres(ip, user, pass, port)
				};
			}
		} catch (error) {
			logger.Error(error);
			return { success: false };
		}
	}
}
