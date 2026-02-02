import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const test = async () => {
    console.log("Starting upload test...");
    console.log("CWD:", process.cwd());

    // Ensure dirs
    const dirs = [
        path.join(process.cwd(), "uploads", "temp"),
        path.join(process.cwd(), "uploads", "original"),
        path.join(process.cwd(), "uploads", "preview"),
        path.join(process.cwd(), "uploads", "thumb")
    ];
    dirs.forEach(d => {
        if (!fs.existsSync(d)) {
            console.log("Creating dir:", d);
            fs.mkdirSync(d, { recursive: true });
        }
    });

    // Create dummy image (1x1 pixel)
    const tempPath = path.join(process.cwd(), "uploads", "temp", "test.jpg");
    // Create a simple buffer (fake jpg header/content is hard, so use sharp to create one)
    console.log("Creating temp file:", tempPath);
    await sharp({
        create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 255, g: 0, b: 0 }
        }
    })
        .jpeg()
        .toFile(tempPath);
    console.log("Temp file created.");

    // Process it
    const originalPath = path.join(process.cwd(), "uploads", "original", "test-processed.jpg");
    console.log("Processing to:", originalPath);

    try {
        await sharp(tempPath)
            .jpeg({ quality: 90 })
            .toFile(originalPath);
        console.log("Success! File saved to:", originalPath);
    } catch (e) {
        console.error("Sharp Error:", e);
    }

    // Cleanup
    /*
    try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        // if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
        console.log("Cleanup done.");
    } catch (e) {
        console.error("Cleanup Error:", e);
    }
    */
};

test();
