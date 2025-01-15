const http2 = require('http2');

// Create an HTTP/2 server
const server = http2.createServer();

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
                storage[path] = JSON.parse(body); // Assuming JSON data
                stream.respond({ ':status': 200 });
                stream.end('Data stored successfully');
            } catch (err) {
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