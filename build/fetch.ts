import * as https from 'https';
import * as http from 'http';
import { getAgent } from './download';

export async function fetch(api: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const httpLibrary = api.startsWith('https') ? https : http;
		httpLibrary.get(api, getAgent(api), res => {
			if (res.statusCode !== 200) {
				reject('Failed to get content from ');
			}

			let data = '';

			res.on('data', chunk => {
				data += chunk;
			});

			res.on('end', () => {
				resolve(data);
			});

			res.on('error', err => {
				reject(err);
			});
		});
	});
}

export async function fetchJSON<T>(api: string): Promise<T> {
	const data = await fetch(api);
	try {
		return JSON.parse(data);
	} catch (err) {
		throw new Error(`Failed to parse response from ${api}`);
	}
}
