import mysql from 'mysql2/promise';

/** @type {import('./$types').PageLoad} */
export async function load({ params, cookies }) {
	const pass = cookies.get('pass');
	const user = cookies.get('user');
	const ip = cookies.get('ip');
	const type = cookies.get('type');

	const databases: Array<string> = [];

	if (user == null || pass == null || ip == null || type == null) {
		return {
			success: true,
			databases: databases
		};
	}else{
		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				database: 'sys',
				password: pass
			});

			const [databases_raw] = await connection.query('SHOW DATABASES;'); // Get all databases
			Array.from(databases_raw).forEach((db) => {
				databases.push(db.Database);
			});
			connection.destroy();
			return {
				success: true,
				databases: databases
			};
		} catch (error) {
			console.error(error);
			return { success: false };
		}
	}
}
