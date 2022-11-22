import { decrypt } from '$lib/crypto/aes';
import { get_all_dbs_mysql } from '$lib/db/mysql/database';
import { get_all_dbs_mssql } from '$lib/db/mssql/database';

/** @type {import('./$types').PageLoad} */
export async function load({ params, cookies }) {
	const pass = decrypt(cookies.get('pass'));
	const user = decrypt(cookies.get('user'));
	const ip = decrypt(cookies.get('ip'));
	const type = decrypt(cookies.get('type'));

	const databases: Array<string> = [];

	if (user == null || pass == null || ip == null || type == null) {
		return {
			success: true,
			databases: databases
		};
	} else {
		try {
			
			if (type == 'MySql') {
				console.log("OK")
				return {
					success: true,
					databases: await get_all_dbs_mysql(ip, user, pass)
				};
			} else if (type == 'MSSQL') {
				return {
					success: true,
					databases: await get_all_dbs_mssql(ip, user, pass)
				};
			}
		} catch (error) {
			console.error(error);
			return { success: false };
		}
	}
}
