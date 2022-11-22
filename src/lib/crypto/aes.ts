import crypto from 'crypto';
import { Buffer } from 'node:buffer';
import dotenv from 'dotenv';
dotenv.config();
export function encrypt(text: string) {
	let pass: string;
	const key = process.env.KEY;
	if(key != null)
		pass = crypto.createHash('md5').update(key).digest('hex');
	else
		throw new Error("Invalid passphrase");

	const iv = process.env.IV;
	if(iv == null)
		throw new Error("Invalid iv");

	const cipher = crypto.createCipheriv(
		'aes-256-cbc',
		Buffer.from(pass),
		Buffer.from(iv)
	);
	let crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

export function decrypt(text: string) {
	let pass: string;
	const key = process.env.KEY;
	if(key != null)
		pass = crypto.createHash('md5').update(key).digest('hex');
	else
		throw new Error("Invalid passphrase");
		
	const iv = process.env.IV;
	if(iv == null)
		throw new Error("Invalid iv");

	const decipher = crypto.createDecipheriv(
		'aes-256-cbc',
		Buffer.from(pass),
		Buffer.from(iv)
	);
	if (text == null) return "";
	let dec = decipher.update(text, 'hex', 'utf8');
	dec += decipher.final('utf8');
	return dec;
}
