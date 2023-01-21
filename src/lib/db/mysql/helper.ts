export function parse_query_update_mysql(
	keys: Array<string>,
	rows: Array<unknown>,
	table: string
): string {
	let query = 'UPDATE ' + table + ' SET ';
	keys.forEach(function callback(key, i) {
		if (typeof rows[i] == 'string' && rows[i].includes('T')) {
			// Is a date, we need to convert it to MySql DateTime
			try {
				rows[i] = '';
			} catch (error) {
				// is not a real date
			}
		}

		if (i != keys.length - 1 && rows[i] != '') {
			query += '`' + key + '`' + ' = ' + "'" + rows[i] + "',"; // We may need to convert this form to a template string
		} else if (rows[i] != '') {
			// The last where don't need AND
			query += '`' + key + '`' + ' = ' + "'" + rows[i] + "'";
		}
	});

	return query;
}
