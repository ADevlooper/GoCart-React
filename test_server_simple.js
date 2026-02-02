import express from 'express';
import { upload, processImages } from './middlewares/upload.js';
import path from 'path';
import fs from 'fs';
import http from 'http';

const app = express();
const PORT = 5001;

// Cleanup previous test
const originalPath = path.join(process.cwd(), "uploads", "original", "integration-test.jpg");
if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);

app.post('/test-upload', upload, processImages, (req, res) => {
    console.log("Handler reached.");
    console.log("Processed:", req.processedImages);
    if (req.processedImages && req.processedImages.length > 0) {
        res.json({ success: true, files: req.processedImages });
    } else {
        res.status(400).json({ success: false, message: "No files" });
    }
});

const server = app.listen(PORT, async () => {
    console.log(`Test server running on ${PORT}`);

    // Simulation Client
    // We need to send multipart/form-data. 
    // Since we don't have 'form-data' package installed by default (maybe), we'll try to construct it or use a simple fetch if node 18+

    try {
        const boundary = '--------------------------testboundary';
        // Create a dummy file content
        const fileContent = 'fake image content';
        // Note: Sharp needs real image header usually, so this might fail at sharp step if we don't use real image.
        // We can reuse the temp file created by test_upload.js if it exists, or create one.

        // Let's create a real small jpeg using sharp first (but we can't strictly rely on it here to prepare input)
        // actually simply reusing the buffer from test_upload.js is smart? 
        // No, let's just use the `test_upload.js` trick to make a dummy valid jpg first.

    } catch (e) {
        console.error(e);
    }
});

// We will use a separate script to CALL this server, or just use curl if available?
// Better: Keep this simple. simpler:
// just run the server. I will use 'curl' from run_command to test it.
