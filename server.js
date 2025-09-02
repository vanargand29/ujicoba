const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware untuk membaca JSON (termasuk gambar base64 cukup besar)
app.use(express.json({ limit: '50mb' }));

// Layani file statis (HTML, CSS, JS, gambar) dari folder ini
app.use(express.static(path.join(__dirname)));

// Path ke file tempat review disimpan
const reviewsFilePath = path.join(__dirname, 'reviews.txt');

// Endpoint POST untuk simpan review
app.post('/save-review', (req, res) => {
    const review = req.body;
    // Tambahkan newline supaya tiap review terpisah
    fs.appendFile(reviewsFilePath, JSON.stringify(review) + '\n', (err) => {
        if (err) {
            console.error('Error writing review to file:', err);
            return res.status(500).json({ message: 'Failed to save review' });
        }
        res.status(200).json({ message: 'Review saved successfully' });
    });
});

// Endpoint GET untuk ambil semua review
app.get('/get-reviews', (req, res) => {
    fs.readFile(reviewsFilePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(200).json([]); // Kalau file belum ada → return kosong
            }
            console.error('Error reading reviews file:', err);
            return res.status(500).json({ message: 'Failed to read reviews' });
        }

        // Pisahkan tiap baris JSON → array objek
        const reviews = data
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    console.error('Invalid JSON:', line);
                    return null;
                }
            })
            .filter(r => r !== null);

        res.status(200).json(reviews);
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
    console.log(`👉 Buka http://localhost:${port}/review.html di browser`);
});
