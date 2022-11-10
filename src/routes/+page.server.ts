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

    if(user == null || pass == null || ip == null || type == null){
      throw redirect(301, "/login");
    }

    try {
      const connection = await mysql.createConnection({
        host: ip,
        user: user,
        database: "sys", 
        password: pass
      });

      // get version
      const [rows] = await connection.query('SELECT VERSION();');
      version = Object.values(rows[0])[0];
      connection.destroy();
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
      }
    };
}

export const actions = {
	db: async ({ cookies, request }) => {
    const db_info = await request.formData();
    const db = db_info.get("db");
    throw redirect(302, "/db_overview?db=" + db);
  }
}