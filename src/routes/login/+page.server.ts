import { redirect } from '@sveltejs/kit';
import mysql from 'mysql2/promise';
import { encrypt } from '$lib/crypto/aes';
import { login_mssql } from '$lib/db/mssql/login';
import postgres from 'postgres';
import { Logger } from '$lib/db/helper/helper';
import sqlite3 from 'sqlite3';

const logger = new Logger();

/** @type {import('./$types').PageLoad} */
export async function load({ params, cookies }) {
	const pass = cookies.get('pass');
	const user = cookies.get('user');
	const ip = cookies.get('ip');
	const type = cookies.get('type'); // We don't need to decrypt this because we check only if the informations is present
	if (user == null || pass == null || ip == null || type == null) {
		// we are already in login page
	} else {
		throw redirect(301, '/');
	}
}

export const actions = {
	login: async ({ cookies, request }) => {
		const form_data = await request.formData();
		let ip = form_data.get('ip');	// Ip or path of DB
		const user = form_data.get('user');
		const pass = form_data.get('pass');
		const type = form_data.get('type');
		let port = ip.split(':')[1];
		ip = ip.split(':')[0];

		try {
			if (type == 'MySql') {
				if (port == null) {
					port = 3306; // default port
				}
				await mysql.createConnection({
					host: ip,
					user: user,
					database: 'sys', // default db
					password: pass,
					port: port
				});
			} else if (type == 'MSSQL') {
				if (port == null) {
					port = 1433;
				}
				login_mssql(user, pass, ip, port);
			} else if (type == 'PostgreSQL') {
				if (port == null) {
					port = 5432;
				}
				postgres(`postgres://${user}:${pass}@${ip}:${port}/postgres`, {
					host: ip,
					port: port,
					database: 'postgres', // default db
					username: user,
					password: pass
				});
			} else if(type == "SQLite"){
				let db = new sqlite3.Database(ip, (err) => {
					if (err) {
						logger.Error(err);
					}
					console.log('Connected to the chinook database.');
				});
			}
		} catch (error) {
			logger.Error(error);
			return { success: false };
		}

		if(type != "SQLite"){
			await cookies.set('ip', encrypt(ip), {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 30
			});
			await cookies.set('user', encrypt(user), {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 30
			});
			await cookies.set('pass', encrypt(pass), {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 30
			});
			await cookies.set('type', encrypt(type), {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 30
			});
		}else{	// SQLite don't need username and password
			await cookies.set('ip', encrypt(ip), {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 30
			});
			await cookies.set('type', encrypt(type), {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 30
			});
		}

		throw redirect(302, '/');
	}
};
