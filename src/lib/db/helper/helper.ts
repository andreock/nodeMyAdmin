
export function parse_query(keys: Array<string>, rows: Array<string | Date | boolean>, table: string) {
	let query = 'DELETE FROM ' + table + ' WHERE (';
	keys.forEach(function callback(key, i) {
		if (typeof rows[i] == 'string' && rows[i].includes('T')) {
			// Is a date, we need to convert it to MySql DateTime
			try {
				rows[i] = '';
			} catch (error) {
				// is not a real date
			}
		}
		if (rows[i] != '' || typeof rows[i] == 'boolean') {
			if (i != keys.length - 1) {
				if (typeof rows[i] != 'boolean')
					query += `${key} = '${rows[i]}' AND `; // The boolean must be written in query without quotes, with quotes became a string and broke the WHERE clause
				else query += `${key} = ${rows[i]} AND `;
			} else {
				if (typeof rows[i] != 'boolean')
					query += `${key} = '${rows[i]}' )`; // The last where don't need AND
				else query += `${key} = ${rows[i]} )`; // The last where don't need AND
			}
		}
	});

	return query;
}

export function parse_query_update(
	keys: Array<string>,
	rows: Array<string | Date | boolean>,
	table: string
) {
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