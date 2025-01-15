const http2 = require('http2');
const fs = require('fs');
const path = require('path');

// Load the key and certificate
const key = fs.readFileSync(path.join('/certs/mr2/', 'key.pem'));
const cert = fs.readFileSync(path.join('/certs/mr2/', 'cert.pem'));

// Create a secure HTTP/2 server
const server = http2.createSecureServer(
    { key, cert },
    (req, res) => {
        const { method, url, headers } = req;

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Hello! You requested ${url}`);
    }
);

// In-memory storage
const storage = {};

// Handle incoming requests
server.on('stream', (stream, headers) => {
    const method = headers[':method'];
    const path = headers[':path'];

    if (method === 'PUT') {
        let body = '';
        stream.on('data', (chunk) => {
            body += chunk;
        });

        stream.on('end', () => {
            try {
                // Store data in memory
                storage[path] = body;
                stream.respond({ ':status': 200 });
                stream.end('Data stored successfully');
                console.log(`stored body`)
            } catch (err) {
                console.log(`error is {err}`)
                stream.respond({ ':status': 400 });
                stream.end('Invalid JSON');
            }
        });
    } else {
        stream.respond({ ':status': 405 });
        stream.end('Method Not Allowed');
    }
});

// Start the server
server.listen(8443, () => {
    console.log('HTTP/2 server is running on https://localhost:8443');
});