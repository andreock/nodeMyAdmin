import process from 'process';
import mysql from 'mysql2/promise';
import { redirect } from '@sveltejs/kit';
import { decrypt } from '$lib/crypto/aes';

/** @type {import('./$types').PageLoad} */
export async function load({ params, cookies }) {
	const pass = decrypt(cookies.get('pass'));
	const user = decrypt(cookies.get('user'));
	const ip = decrypt(cookies.get('ip'));
	const type = decrypt(cookies.get('type')); // type of db

	let version = ''; // version  of DB
	if (user == null || pass == null || ip == null || type == null) {
        throw redirect(301, "/login");  
	}

	try {
		const connection = await mysql.createConnection({
			host: ip,
			user: user,
			database: 'sys',
			password: pass
		});

		// get version
		const [rows] = await connection.query('SELECT VERSION();');
		version = Object.values(rows[0])[0]; // Version of db
		connection.destroy();
	} catch (error) {
		console.error(error);
		return { success: false };
	}

	return {
		success: true,
		version: process.version, // Node js Version
		os: process.platform, // OS where NodeMyAdmin is running
		db: {
			// Info to login on db
			user: user,
			pass: pass,
			ip: ip,
			type: type,
			version: version
		}
	};
}

export const actions = {
	db: async ({ cookies, request }) => {
		const db_info = await request.formData();
		const db = db_info.get('db'); // Get db name
		throw redirect(302, '/db_overview?db=' + db); // Go to db overview based on db saves on cookies
	},
	create: async ({ cookies, request }) => {
		const form = await request.formData();
		const pass = decrypt(cookies.get('pass'));
		const user = decrypt(cookies.get('user'));
		const ip = decrypt(cookies.get('ip'));
		
		try {
			const connection = await mysql.createConnection({
				host: ip,
				user: user,
				password: pass,
				database: 'sys' // Default database of MySQL, we don't know what db is selected since we want to create a new one
			});
			connection.connect();
			await connection.query('CREATE DATABASE ' + form.get('db'));
			connection.destroy();
			return { success: true };
		} catch (error) {
			return { success: false };
		}
	}
};
