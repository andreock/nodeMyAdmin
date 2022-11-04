import process from 'process';
import mysql from 'mysql2/promise';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, cookies }) {
    const pass = cookies.get('pass');
    const user = cookies.get('user');
    const ip = cookies.get('ip');
    const type = cookies.get('type');
    let version = ""; // version  of DB
    const databases: Array<string> = [];

    if(user == null || pass == null || ip == null || type == null){
      throw redirect(301, "/login");
    }

    try {
      const connection = await mysql.createConnection({
        host: ip,
        user: user,
        database: 'sys',  // default DB of mysql
        password: pass
      });

      // get version
      const [rows] = await connection.query('SELECT VERSION();');
      version = Object.values(rows[0])[0];

      const [databases_raw] = await connection.query('SHOW DATABASES;');
      databases_raw.forEach(db => {
        databases.push(db.Database);
      }); 
    } catch (error) {
      console.error(error);
      return { success: false };
    }

    return { 
      success: true, 
      version: process.version,
      os: process.platform,
      db:{
        user: user,
        pass: pass,
        ip: ip,
        type: type,
        version: version
      },
      databases: databases
    };
}

export const actions = {
	db: async ({ cookies, request }) => {
    const db_info = await request.formData();
    const db = db_info.get("db");

    return db;
  }
}