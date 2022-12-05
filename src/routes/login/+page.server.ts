import { redirect } from '@sveltejs/kit';
import mysql from 'mysql2/promise';
import { encrypt } from '$lib/crypto/aes';
import { login_mssql } from '$lib/db/mssql/login';

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
		const ip = form_data.get('ip');
		const user = form_data.get('user');
		const pass = form_data.get('pass');
		const type = form_data.get('type');

		try {
			if (type == 'MySql') {
				await mysql.createConnection({
					host: ip,
					user: user,
					database: 'sys',
					password: pass
				});
			} else if (type == 'MSSQL') {
				login_mssql(user, pass, ip);
			}
		} catch (error) {
			console.error(error);
			return { success: false };
		}

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
		throw redirect(302, '/');
	}
};
