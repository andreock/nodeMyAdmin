import mysql from 'mysql2/promise';

export async function get_mysql_version(ip: string, user: string, pass: string): Promise<string> {
	try {
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: 'sys',
			password: pass
		});

		// get version
		const [rows] = await connection.query('SELECT VERSION();');
		const version = Object.values(rows[0])[0];
		connection.destroy();
		if (typeof version === 'string') return version; // Version of db
		else return '';
	} catch (error) {
		throw error;
	}
}
