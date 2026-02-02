import http from 'http';
import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), "uploads", "original", "test-processed.jpg");
if (!fs.existsSync(file)) {
    console.error("Test file not found:", file);
    process.exit(1);
}
const content = fs.readFileSync(file);
const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";

// Construct body manually
const header = `--${boundary}\r\nContent-Disposition: form-data; name="images"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
const footer = `\r\n--${boundary}--\r\n`;

const postData = Buffer.concat([
    Buffer.from(header),
    content,
    Buffer.from(footer)
]);

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/test-upload',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': postData.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.pipe(process.stdout);
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
