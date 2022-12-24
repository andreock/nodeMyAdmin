import mssql from 'mssql';

export async function get_mssql_version(
	ip: string,
	user: string,
	password: string,
	port: string
): Promise<string> {
	if (port == null) port = '1433';
	const sqlConfig = {
		user: user,
		password: password,
		database: 'master', // this is the default database
		server: ip,
		port: port,
		pool: {
			max: 1,
			min: 0,
			idleTimeoutMillis: 30000
		},
		options: {
			encrypt: true, // for azure
			trustServerCertificate: true // change to true for local dev / self-signed certs
		}
	};
	try {
		// make sure that any items are correctly URL encoded in the connection string
		await mssql.connect(sqlConfig);
		const result = await mssql.query`SELECT @@VERSION AS 'SQL Server Version Details'`;
		return result.recordset[0]['SQL Server Version Details'];
	} catch (err) {
		throw err;
	}
}
