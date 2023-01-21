import mysql from 'mysql2/promise';
import { Logger } from '../helper/helper';

const logger = new Logger();
export async function get_mysql_version(
	ip: string,
	user: string,
	pass: string,
	port: string
): Promise<string> {
	try {
		if (port == null) port = '3306';
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: 'sys',
			password: pass,
			port: parseInt(port)
		});

		// get version
		const [rows] = await connection.query('SELECT VERSION();');
		const version = Object.values(rows[0])[0];
		connection.destroy();
		if (typeof version === 'string') return version; // Version of db
		else return '';
	} catch (error) {
		logger.Error(error);
	}
}
