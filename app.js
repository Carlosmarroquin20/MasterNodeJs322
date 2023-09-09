const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3003; // Cambia el puerto si es necesario

app.use(express.static('public'));

// Configura Multer para almacenar archivos en la carpeta 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    const fileName = `${Date.now()}${extname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('El archivo adjunto debe ser una imagen.'), false);
    }
  },
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/contact', upload.single('dpiFile'), (req, res) => {
  const { nombre, email } = req.body;
  const dpiFile = req.file;

  // Cargar contactos existentes si el archivo existe
  let contacts = [];
  if (fs.existsSync('contacts.json')) {
    contacts = JSON.parse(fs.readFileSync('contacts.json', 'utf8'));
  }

  // Guarda los datos en un objeto de contacto
  const contactData = {
    nombre,
    email,
    dpiFileName: dpiFile.filename,
  };

  // Agrega el nuevo contacto a la lista de contactos
  contacts.push(contactData);

  // Guarda la lista actualizada de contactos en el archivo JSON
  fs.writeFileSync('contacts.json', JSON.stringify(contacts));

  res.redirect('/contacts');
});

app.get('/contacts', (req, res) => {
  let contacts = [];
  if (fs.existsSync('contacts.json')) {
    contacts = JSON.parse(fs.readFileSync('contacts.json', 'utf8'));
  }
  res.send(contacts);
});

// Ruta para mostrar el archivo files.html
app.get('/files', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'files.html'));
});

app.get('/download', (req, res) => {
    const archivo = req.query.archivo;
    const filePath = path.join(__dirname, 'uploads', archivo);
    res.download(filePath);
  });
  

app.listen(port, () => {
  console.log(`Servidor web en http://localhost:${port}`);
});
