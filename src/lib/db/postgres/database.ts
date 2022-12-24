import postgres from 'postgres';

export async function get_all_dbs_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string | undefined
) {
	if (port == null) throw new Error('Invalid port');
	const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/postgres`, {
		host: ip,
		port: parseInt(port),
		database: 'postgres', // default db
		username: user,
		password: pass
	});
	const databases = await sql`SELECT datname FROM pg_database;`;
	sql.end();
	return databases.map((db) => db.datname);
}

export async function create_db_postgres(
	ip: string,
	user: string,
	pass: string,
	port: string,
	db: string
) {
	if (port == null) throw new Error('Invalid port');
	const sql = postgres(`postgres://${user}:${pass}@${ip}:${port}/postgres`, {
		host: ip,
		port: parseInt(port),
		database: 'postgres', // default db
		username: user,
		password: pass
	});
	await sql`CREATE DATABASE ${sql(db)};`;
	sql.end();
}
