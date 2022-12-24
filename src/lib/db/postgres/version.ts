import postgres from 'postgres';

export async function get_postgres_version(
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
	const version = await sql`SELECT version();`;
	sql.end();
	return version[0].version;
}
