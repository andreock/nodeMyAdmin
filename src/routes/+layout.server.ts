import mysql from 'mysql2/promise';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, cookies }) {
    const pass = cookies.get('pass');
    const user = cookies.get('user');
    const ip = cookies.get('ip');
    const type = cookies.get('type');

    const databases: Array<string> = [];

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

      const [databases_raw] = await connection.query('SHOW DATABASES;');
      Array.from(databases_raw).forEach(db => {
        databases.push(db.Database);
      }); 
      connection.destroy();
    } catch (error) {
      console.error(error);
      return { success: false };
    }

    return { 
      success: true, 
      databases: databases
    };
}