import sql from 'mssql';

export async function login_mssql(user: string, pass: string, ip: string, port: number) {
	const sqlConfig = {
		user: user,
		password: pass,
		database: 'master', // default database
		server: ip,
		pool: {
			max: 1,
			min: 0,
			idleTimeoutMillis: 30000
		},
		options: {
			encrypt: true, // for azure
			trustServerCertificate: true // change to true for local dev / self-signed certs
		},
		port: port
	};
	try {
		await sql.connect(sqlConfig);
	} catch (error) {
		throw error;
	}
}
