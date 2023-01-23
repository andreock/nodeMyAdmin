import { parse_query } from "$lib/db/helper/helper";
import { parse_query_update_mssql } from "$lib/db/mssql/helper";
import { add_record_mssql, delete_record_mssql, records_mssql, update_record_mssql } from "$lib/db/mssql/record";
import { create_table_mssql, delete_field_mssql, drop_table_mssql, get_all_tables_mssql, search_in_table_mssql, struct_mssql, truncate_table_mssql } from "$lib/db/mssql/table";
import { parse_query_update_mysql } from "$lib/db/mysql/helper";
import { add_record_mysql, delete_record_mysql, records_mysql, struct_mysql, update_record_mysql } from "$lib/db/mysql/record";
import { create_table_mysql, delete_field_mysql, drop_table_mysql, get_all_tables_mysql, search_in_table_mysql, truncate_table_mysql } from "$lib/db/mysql/table";
import { add_record_postgres, delete_record_postgres, records_postgres, update_record_postgres } from "$lib/db/postgres/records";
import { create_table_postgres, delete_field_postgres, drop_table_postgres, get_all_tables_postgres, search_in_table_postgres, struct_postgres, truncate_table_postgres } from "$lib/db/postgres/table";
import { add_record_sqlite, delete_record_sqlite, records_sqlite } from "$lib/db/sqlite3/records";
import { create_table_sqlite, delete_field_sqlite, drop_table_sqlite, get_all_tables_sqlite, search_in_table_sqlite, struct_sqlite, truncate_table_sqlite } from "$lib/db/sqlite3/table";
import { pino } from 'pino';

export class Server {
    #ip: string;
    #port: string;
    #user: string;
    #pass: string;
    #db: string;
    #type: string;

    constructor() {
        this.#user = "";    // Avoid typescript errors
        this.#pass = "";
        this.#ip = "";
        this.#port = "";
        this.#db = "";
        this.#type = "";
    };

    CreateServer(user: string | null, pass: string | null, ip: string | null | undefined, port: string | undefined, type: string) {

        if(type == "SQLite" && ip != null && type != null){
            this.#ip = ip;
            this.#type = type;
            return;
        }

        if (ip == null || port == null || user == null || pass == null) throw new Error("Invalid parameters in login"); // Exit because this is almost impossible
        this.#user = user;
        this.#pass = pass;
        this.#ip = ip;
        this.#port = port;
        this.#type = type;
    }

    ChangeDB(db: string) {
        this.#db = db;
    }

    async GetAllTables() {
            if (this.#type == 'MySql') {
                return { db: this.#db, tables: get_all_tables_mysql(this.#ip, this.#user, this.#pass, this.#db, this.#port) };
            } else if (this.#type == 'MSSQL') {
                return { db: this.#db, tables: get_all_tables_mssql(this.#ip, this.#user, this.#pass, this.#db, this.#port) };
            } else if (this.#type == 'PostgreSQL') {
                return { db: this.#db, tables: await get_all_tables_postgres(this.#ip, this.#user, this.#pass, this.#port, this.#db) };
            }else if(this.#type == 'SQLite'){
                return { db: this.#db, tables: await get_all_tables_sqlite(this.#ip) };
            }

    }

    SetType(type: string) {
        this.#type = type;
    }

    async Rows(table: string) {
            if (this.#type == 'MySql') {
                const rows = await records_mysql(this.#ip, this.#user, this.#pass, this.#db, table, this.#port);
                return {
                    success: true,
                    records: rows.cols_raw.map((row) => {
                        return {
                            name: row['name'],
                            type: row['columnType']
                        };
                    })
                };
            } else if (this.#type == 'MSSQL') {
                const rows = await struct_mssql(this.#ip, this.#user, this.#pass, this.#db, table, this.#port);
                return {
                    success: true,
                    records: rows.map((row) => {
                        return {
                            name: row['Field'],
                            type: row['Type']
                        };
                    })
                };
            } else if (this.#type == 'PostgreSQL') {
                const rows = await struct_postgres(this.#ip, this.#user, this.#pass, this.#port, this.#db, table);
                return {
                    success: true,
                    records: rows.map((row) => {
                        return {
                            name: row['Field'],
                            type: row['type_id']
                        };
                    })
                };
            }else if(this.#type == 'SQLite') {
                const rows = await struct_sqlite(this.#ip, table);
                return { success: true,
                        records: rows.map((row) => {
                            return {
                                name: row.Field,
                                type: row.Type
                            };
                        })
                }
            }
    }

    async Records(table: string) {
            const query = 'SELECT * FROM ' + table;
            const type_request = 'records';

            if (this.#type == 'MySql') {
                const result = await records_mysql(this.#ip, this. #user, this.#pass, this.#db, table, this.#port);
                return {
                    records: result.rows,
                    cols: result.cols,
                    selected: table,
                    query: query,
                    type: type_request,
                    db: this.#db
                };
            } else if (this.#type == 'MSSQL') {
                let result = await records_mssql(this.#ip, this.#user, this.#pass, this.#db, table, this.#port);
                if (result[0] == null) {
                    result = [{}];
                }
                return {
                    records: result,
                    cols: Object.keys(result[0]), // We take the first element since is always the same
                    selected: table,
                    query: query,
                    type: type_request,
                    db: this.#db
                };
            } else if (this.#type == 'PostgreSQL') {
                let result = await records_postgres(this.#ip, this.#user, this.#pass, this.#port, this.#db, table);
                return {
                    records: result.rows,
                    cols: result.cols, // We take the first element since is always the same
                    selected: table,
                    query: query,
                    type: type_request,
                    db: this.#db
                };
            } else if(this.#type == 'SQLite') {
                let result = await records_sqlite(this.#ip, query);
                if(result[0] == null) result.push({});  // If the table is empty the array is empty so sveltekit can't return a null in the response of endpoint,
                                                        // workaround: push an empty object so that object.keys will be an empty array.
                return {
                    records: result,
                    cols: Object.keys(result[0]), // We take the first element since is always the same
                    selected: table,
                    query: query,
                    type: type_request,
                    db: this.#db
                };
            }
    }

    async Struct(table: string){
            const type_request = 'struct';
			if (this.#type == 'MySql') {
				return {
					cols: await struct_mysql(this.#ip, this.#user, this.#pass, this.#db, table, this.#port),
					selected: table,
					type: type_request,
					db: this.#db
				};
			} else if (this.#type == 'MSSQL') {
				return {
					cols: await struct_mssql(this.#ip, this.#user, this.#pass, this.#db, table, this.#port),
					selected: table,
					type: type_request,
					db: this.#db
				};
			} else if (this.#type == 'PostgreSQL') {
				return {
					cols: await struct_postgres(this.#ip, this.#user, this.#pass, this.#port, this.#db, table),
					selected: table,
					type: type_request,
					db: this.#db
				};
			}else if(this.#type == 'SQLite') {
				return {
					cols: await struct_sqlite(this.#ip, table),
					selected: table,
					type: type_request,
					db: this.#db
				};
            }
    }

    async Delete(table: string, col: string){
			if (this.#type == 'MySql') {
				await delete_field_mysql(this.#ip, this.#user, this.#pass, this.#db, table, col, this.#port);
			} else if (this.#type == 'MSSQL') {
				await delete_field_mssql(this.#ip, this.#user, this.#pass, this.#db, table, col, this.#port);
			} else if (this.#type == 'PostgreSQL') {
				await delete_field_postgres(this.#ip, this.#user, this.#pass, this.#port, this.#db, table, col);
			} else if (this.#type == 'SQLite') {
                await delete_field_sqlite(this.#ip, table, col);
            }
			return { success: true, type: 'delete' };
    }

    async DeleteRecord(table: string, keys: string[], rows: string[]){
			if (this.#type == 'MySql') {
				const query = parse_query(keys, rows, table);
				await delete_record_mysql(this.#ip, this.#user, this.#pass, this.#db, query, this.#port);
			} else if (this.#type == 'MSSQL') {
				const query = parse_query(keys, rows, table);
				await delete_record_mssql(this.#ip, this.#user, this.#pass, this.#db, table, query, this.#port);
			} else if (this.#type == 'PostgreSQL') {
				await delete_record_postgres(this.#ip, this.#user, this.#pass, this.#port, this.#db, table, keys, rows);
			} else if (this.#type == 'SQLite') {
                const query = parse_query(keys, rows, table);
                await delete_record_sqlite(this.#ip, query);
            }
			return { success: true, type: 'delete' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
    }

    async Update(table: string, keys: string[], rows: unknown[], old_keys: string[], old_rows: unknown[]) {
			if (this.#type == 'MySql') {
				const query =
					parse_query_update_mysql(keys, rows, table) +
					parse_query(old_keys, old_rows, table).replace('DELETE FROM ' + table, '');

				await update_record_mysql(this.#ip, this.#user, this.#pass, this.#db,  query, this.#port);
			} else if (this.#type == 'MSSQL') {
				const query =
					parse_query_update_mssql(keys, rows, table) +
					parse_query(old_keys, old_rows, table).replace('DELETE FROM ' + table, '');

				await update_record_mssql(this.#ip, this.#user, this.#pass, this.#db, table, query, this.#port);
			} else if (this.#type == 'PostgreSQL') {
				await update_record_postgres(
                    this.#ip, this.#user, this.#pass,
					this.#port,
					this.#db,
					table,
					keys,
					rows,
					old_keys,
					old_rows
				);
			}else if(this.#type == 'SQLite') {}
			return { success: true, type: 'update' };
    }

    async Add(table: string, records: string){

			if (this.#type == 'MySql') {
				await add_record_mysql(this.#ip, this.#user, this.#pass, this.#db, table, records, this.#port);
			} else if (this.#type == 'MSSQL') {
				await add_record_mssql(this.#ip, this.#user, this.#pass, this.#db, table, JSON.parse(records), this.#port);
			} else if (this.#type == 'PostgreSQL') {
				await add_record_postgres(this.#ip, this.#user, this.#pass, this.#port, this.#db, table, JSON.parse(records));
			} else if (this.#type == 'SQLite') {
                await add_record_sqlite(this.#ip, table, JSON.parse(records));
            }
			return { success: true, type: 'add' };
    }

    async Truncate(table: string){
			if (this.#type == 'MySql') {
				await truncate_table_mysql(this.#ip, this.#user, this.#pass, this.#db, table, this.#port);
			} else if (this.#type == 'MSSQL') {
				await truncate_table_mssql(this.#ip, this.#user, this.#pass, this.#db, table, this.#port);
			} else if (this.#type == 'PostgreSQL') {
				await truncate_table_postgres(this.#ip, this.#user, this.#pass, this.#port, this.#db, table);
			} else if (this.#type == 'SQLite') {
                await truncate_table_sqlite(this.#ip, table);
            }
			return { success: true, type: 'truncate' };
    }

    async Drop(table: string){
			if (this.#type == 'MySql') {
				await drop_table_mysql(this.#ip, this.#user, this.#pass, this.#db, table, this.#port);
			} else if (this.#type == 'MSSQL') {
				await drop_table_mssql(this.#ip, this.#user, this.#pass, this.#db, table, this.#port);
			} else if (this.#type == 'PostgreSQL') {
				await drop_table_postgres(this.#ip, this.#user, this.#pass, this.#port, this.#db, table);
			}else if(this.#type == 'SQLite') {
                await drop_table_sqlite(this.#ip, table);
            }
			return { success: true, type: 'drop' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
    }

    async Search(table: string, records: string){
			if (this.#type == 'MySql') {
				return {
					success: true,
					type: 'search',
					rows: JSON.stringify(
						await search_in_table_mysql(this.#ip, this.#user, this.#pass, this.#db, table, JSON.parse(records), this.#port)
					)
				};
			} else if (this.#type == 'MSSQL') {
				return {
					success: true,
					type: 'search',
					rows: JSON.stringify(
						await search_in_table_mssql(this.#ip, this.#user, this.#pass, this.#db, table, JSON.parse(records), this.#port)
					)
				};
			} else if (this.#type == 'PostgreSQL') {
				return {
					success: true,
					type: 'search',
					rows: JSON.stringify(
						await search_in_table_postgres(this.#ip, this.#user, this.#pass, this.#db, table, this.#port, JSON.parse(records))
					)
				};
			} else if (this.#type == 'SQLite') {
                return {
					success: true,
					type: 'search',
					rows: JSON.stringify(
						await search_in_table_sqlite(this.#ip, table, JSON.parse(records))
					)
				};
            }
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
    }

    async Create(table: string, fields: string[]){
			if (this.#type == 'MySql') {
				create_table_mysql(this.#ip, this.#user, this.#pass, this.#db, table, fields, this.#port);
			} else if (this.#type == 'MSSQL') create_table_mssql(this.#ip, this.#user, this.#pass, this.#db, table, fields, this.#port);
			else if (this.#type == 'PostgreSQL') {
				create_table_postgres(this.#ip, this.#user, this.#pass, this.#port, this.#db, table, fields);
			} else if (this.#type == 'SQLite') create_table_sqlite(this.#ip, table, fields);
			return { success: true, type: 'create' };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
}   