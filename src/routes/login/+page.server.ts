import { redirect } from '@sveltejs/kit';
import mysql from 'mysql2/promise';
import { encrypt } from '$lib/crypto/aes';

/** @type {import('./$types').PageLoad} */
export async function load({ params, cookies }) {
	const pass = cookies.get('pass');
	const user = cookies.get('user');
	const ip = cookies.get('ip');
	const type = cookies.get('type');	// We don't need to decrypt this because we check only if the informations is present
	if (user == null || pass == null || ip == null || type == null) {
		// we are already in login page
    }else{
        throw redirect(301, "/");
    }
}

export const actions = {
	login: async ({ cookies, request }) => {
		const form_data = await request.formData();
		const ip = form_data.get('ip');
		const user = form_data.get('user');
		const pass = form_data.get('pass');
		const type = form_data.get('type');

		// try {	
		// 	await mysql.createConnection({
		// 		host: ip,
		// 		user: user,
		// 		database: 'sys',
		// 		password: pass
		// 	});
		// } catch (error) {
		// 	return { success: false };
		// }

		// Save all in cookies, we need for other actions
		await cookies.set('ip', encrypt(ip), {
			// send cookie for every page
			path: '/',
			// server side only cookie so you can't use `document.cookie`
			httpOnly: true,
			// only requests from same site can send cookies
			// https://developer.mozilla.org/en-US/docs/Glossary/CSRF
			sameSite: 'strict',
			// only sent over HTTPS in production
			secure: process.env.NODE_ENV === 'production',
			// set cookie to expire after a month
			maxAge: 60 * 60 * 24 * 30
		});
		await cookies.set('user', encrypt(user), {
			// send cookie for every page
			path: '/',
			// server side only cookie so you can't use `document.cookie`
			httpOnly: true,
			// only requests from same site can send cookies
			// https://developer.mozilla.org/en-US/docs/Glossary/CSRF
			sameSite: 'strict',
			// only sent over HTTPS in production
			secure: process.env.NODE_ENV === 'production',
			// set cookie to expire after a month
			maxAge: 60 * 60 * 24 * 30
		});
		await cookies.set('pass', encrypt(pass), {
			// send cookie for every page
			path: '/',
			// server side only cookie so you can't use `document.cookie`
			httpOnly: true,
			// only requests from same site can send cookies
			// https://developer.mozilla.org/en-US/docs/Glossary/CSRF
			sameSite: 'strict',
			// only sent over HTTPS in production
			secure: process.env.NODE_ENV === 'production',
			// set cookie to expire after a month
			maxAge: 60 * 60 * 24 * 30
		});
		await cookies.set('type', encrypt(type), {
			// send cookie for every page
			path: '/',
			// server side only cookie so you can't use `document.cookie`
			httpOnly: true,
			// only requests from same site can send cookies
			// https://developer.mozilla.org/en-US/docs/Glossary/CSRF
			sameSite: 'strict',
			// only sent over HTTPS in production
			secure: process.env.NODE_ENV === 'production',
			// set cookie to expire after a month
			maxAge: 60 * 60 * 24 * 30
		});
		throw redirect(302, "/");
	}
};
