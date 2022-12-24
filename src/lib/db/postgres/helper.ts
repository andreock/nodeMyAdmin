export function parse_query_postgres(keys: Array<string>, rows: Array<string | Date | boolean>) {
	let query = 'where ';

	keys.forEach(function callback(key, i) {
		if (typeof rows[i] == 'string' && rows[i].includes('T')) {
			// Is a date, we need to convert it to MySql DateTime
			try {
				const date = new Date(rows[i]);
				date.setHours(date.getHours() + 1); // We need to add an hour to convert to MySql Date successfully
				rows[i] = date.toISOString().slice(0, 19).replace('T', ' ');
			} catch (error) {
				console.error(error);
				// is not a real date
			}
		}
		if (rows[i] != '' || typeof rows[i] == 'boolean') {
			if (i != keys.length - 1) {
				if (typeof rows[i] != 'boolean' && isNaN(rows[i]))
					query += `${key} = '${rows[i]}' AND `; // The boolean and number must be written in query without quotes, with quotes became a string and broke the WHERE clause
				else query += `${key} = ${rows[i]} AND `;
			} else {
				if (typeof rows[i] != 'boolean' && isNaN(rows[i]))
					query += `${key} = '${rows[i]}' `; // The last where don't need AND
				else query += `${key} = ${rows[i]} `; // The last where don't need AND
			}
		}
	});
	return query;
}

export function parse_query_update_postgres(
	keys: Array<string>,
	rows: Array<string | Date | boolean>
): string {
	let query = '';
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
			if (typeof rows[i] != 'boolean' && isNaN(rows[i]))
				// number and boolean don't need quotes
				query +=
					key +
					' = ' +
					"'" +
					rows[i] +
					"',"; // We may need to convert this form to a template string
			else query += key + ' = ' + rows[i] + ','; // We may need to convert this form to a template string
		} else if (rows[i] != '') {
			if (typeof rows[i] != 'boolean' && isNaN(rows[i]))
				// number and boolean don't need quotes
				query += key + ' = ' + "'" + rows[i] + "'"; // The last where don't need AND
			else query += key + ' = ' + rows[i] + "'"; // We may need to convert this form to a template string
		}
	});

	return query;
}
