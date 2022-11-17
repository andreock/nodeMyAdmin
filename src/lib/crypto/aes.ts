import crypto from 'crypto';
import { Buffer } from 'node:buffer';
import dotenv from 'dotenv';
dotenv.config();
export function encrypt(text: string) {
    const pass = crypto.createHash('md5').update(process.env.KEY).digest('hex');
	const cipher = crypto.createCipheriv(
		'aes-256-cbc',
		Buffer.from(pass),
		Buffer.from(process.env.IV)
	);
	let crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

export function decrypt(text: string) {
    const pass = crypto.createHash('md5').update(process.env.KEY).digest('hex');
	const decipher = crypto.createDecipheriv(
		'aes-256-cbc',
		Buffer.from(pass),
		Buffer.from(process.env.IV)
	);
    if(text == null)    return null;
	let dec = decipher.update(text, 'hex', 'utf8');
	dec += decipher.final('utf8');
	return dec;
}