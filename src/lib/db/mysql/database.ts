import mysql from 'mysql2/promise';

export async function get_all_dbs_mysql(
	ip: string,
	user: string,
	pass: string
): Promise<Array<string>> {
	try {
		const databases: Array<string> = [];
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
		return databases;
	} catch (error) {
		throw error;
	}
}

export async function create_db_mysql(ip: string, user: string, pass: string, db: string) {
	try {
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			password: pass,
			database: 'sys' // Default database of MySQL, we don't know what db is selected since we want to create a new one
		});
		connection.connect();
		await connection.query('CREATE DATABASE ' + db);
		connection.destroy();
	} catch (error) {
		throw error;
	}
}
