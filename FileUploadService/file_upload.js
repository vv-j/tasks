const express = require('express');
const multer = require('multer');
const path =require('path');
const fs = require('fs');
const app =express();

// storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,'./uploads'); 
  },
  filename: (req, file, cb) => {
    
    cb(null, Date.now() +'_' + file.originalname); 
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      cb(null, true);
    }
     else {
      cb(new Error('Invalid file type'), false); 
    }
  }
});


app.use('/uploads', express.static('uploads'));

// index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'index.html'));
});

// file upload
app.post('/upload', upload.single('image'), (req,res) => {
  if (!req.file) {
       return res.status(400).send('No file uploaded');
  }
  res.send('File uploaded successfully!');
});

// list files
app.get('/files', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
          return res.status(500).send('Error reading files');
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const filteredFiles = files.filter(file => {
         const ext = path.extname(file).toLowerCase();
      return allowedExtensions.includes(ext);
    });

    res.json(filteredFiles); 
  });
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
