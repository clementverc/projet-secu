const { createServer } = require('https');
const { readFileSync } = require('fs');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// SETUP APP
const app = express();
const maxFileSize = 4194304; //Octet
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/'));
//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {

    //specify diskStorage (another option is memory)
    storage: multer.diskStorage({
        destination: function(req, file, next){
            next(null, './photo-storage');
        },
        filename: function(req, file, next){
            console.log(file);
            next(null, file.fieldname + '-' + Date.now() + getExtension(file))
        }
    }),
    limits: { fileSize: maxFileSize, files: 1 },
    // filter out and prevent non-image files.
    fileFilter: function(req, file, next){
        if(!file){
            next();
        }
        // only permit image mimetypes
        const image = file.mimetype.startsWith('image/');
        if(image){
            console.log('photo uploaded');
            next(null, true);
        }else{
            console.log("file not supported")
            return next();
        }
    }
};

function getExtension(file) {
    // this function gets the filename extension by determining mimetype. To be exanded to support others, for example .jpeg or .tiff
    let res = '';
    if (file.mimetype === 'image/jpeg') res = '.jpg';
    if (file.mimetype === 'image/png') res = '.png';
    if (file.mimetype === 'image/jpeg') res = '.jpeg';
    return res;
}

/* ROUTES
**********/
app.get('/', function(req, res){
    res.send(`
        <form action="/upload" enctype="multipart/form-data" method="POST">
            <div class="inner-wrap">
            <label><input type="file" id="photo" name="photo" /></label>
            <div class="button-section">
            <input type="submit" name="Upload" value="Upload Photo"/>
            </div>
            </div>
            </div>
        </form>`)
});

app.post('/upload', multer(multerConfig).single('photo'),function(req, res){
        //res.send('Complete! Enregistrement si image');
        res.redirect('/')
    }

);

createServer(
    {
        key: readFileSync(process.env.SSL_KEY),
        cert: readFileSync(process.env.SSL_CERT),
    },
    app
).listen(process.env.PORT);