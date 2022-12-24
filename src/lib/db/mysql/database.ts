import mysql from 'mysql2/promise';

export async function get_all_dbs_mysql(
	ip: string,
	user: string,
	pass: string,
	port: string
): Promise<Array<string>> {
	try {
		if(port == null) port = "3306";
		const databases: Array<string> = [];
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: 'sys',
			password: pass,
			port: parseInt(port)
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

export async function create_db_mysql(ip: string, user: string, pass: string, db: string, port: string) {
	try {
		if(port == null) port = "3306";
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			password: pass,
			database: 'sys', // Default database of MySQL, we don't know what db is selected since we want to create a new one
			port: parseInt(port)
		});
		connection.connect();
		await connection.query('CREATE DATABASE ' + db);
		connection.destroy();
	} catch (error) {
		throw error;
	}
}
