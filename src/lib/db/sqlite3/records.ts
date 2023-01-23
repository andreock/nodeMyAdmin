import { execute, execute_with_params } from "./helper";

export async function records_sqlite(path: string, query: string) {
    const records = await execute(path, query);
    return records;
}

export async function delete_record_sqlite(path: string, query: string) {
    await execute(path, query);
}

export async function add_record_sqlite(path: string, table: string, records: object){
    let interrogative = "";
    for (let index = 0; index < Object.keys(records).length; index++) { // Calcolate the quanitty of ? in values
        interrogative += "?,";   
    }
    interrogative = interrogative.slice(0, -1); // Remove last comma
    const query = `INSERT INTO ${table} VALUES(${interrogative})`;
    await execute_with_params(path, query, Object.values(records));
}