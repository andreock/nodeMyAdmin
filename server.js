// my-server.js
import { handler } from './build/handler.js';
import express from 'express';
import compression from 'compression';

const app = express();
app.use(compression());

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
	res.end('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

app.listen(3000, () => {
	console.log('nodeMyAdmin running on port 3000');
});
