import * as https from 'https';
import * as http from 'http';
import * as createHttpsProxyAgent from 'https-proxy-agent';
import * as createHttpProxyAgent from 'http-proxy-agent';
import { URL } from 'url';
import { createWriteStream } from 'fs';

const reset = '\x1b[G\x1b[0K';

let PROXY_AGENT: createHttpProxyAgent.HttpProxyAgent | undefined = undefined;
let HTTPS_PROXY_AGENT: createHttpsProxyAgent.HttpsProxyAgent | undefined = undefined;

if (process.env.npm_config_proxy) {
	PROXY_AGENT = createHttpProxyAgent(process.env.npm_config_proxy);
	HTTPS_PROXY_AGENT = createHttpsProxyAgent(process.env.npm_config_proxy);
}
if (process.env.npm_config_https_proxy) {
	HTTPS_PROXY_AGENT = createHttpsProxyAgent(process.env.npm_config_https_proxy);
}

export function getAgent(url: string): https.RequestOptions {
	const parsed = new URL(url);
	const options: https.RequestOptions = {};
	if (PROXY_AGENT && parsed.protocol.startsWith('http:')) {
		options.agent = PROXY_AGENT;
	}

	if (HTTPS_PROXY_AGENT && parsed.protocol.startsWith('https:')) {
		options.agent = HTTPS_PROXY_AGENT;
	}

	return options;
}


export async function download(downloadUrl: string, destination: string, message: string) {
	process.stdout.write(message);

	return new Promise((resolve, reject) => {
		const httpLibrary = downloadUrl.startsWith('https') ? https : http;

		httpLibrary.get(downloadUrl, getAgent(downloadUrl), res => {
			if (res.statusCode === 302 && res.headers.location) {
				download(res.headers.location, destination, "").then(() => resolve(destination));
				return;
			}

			const total = Number(res.headers['content-length']);
			let received = 0;
			let timeout: NodeJS.Timeout | undefined;

			const outStream = createWriteStream(destination);
			outStream.on('close', () => resolve(destination));
			outStream.on('error', reject);

			res.on('data', chunk => {
				if (!timeout) {
					timeout = setTimeout(() => {
						process.stdout.write(`${reset}${message}: ${received}/${total} (${(received / total * 100).toFixed()}%)`);
						timeout = undefined;
					}, 100);
				}

				received += chunk.length;
			});
			res.on('end', () => {
				if (timeout) {
					clearTimeout(timeout);
				}

				process.stdout.write(`${reset}${message}: complete\n`);
			});


			res.on('error', reject);
			res.pipe(outStream);
		});
	});
}
