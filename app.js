const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

require('./utils/db')
const Contact = require('./model/contact')


const app = express()

const port = 3000


// Gunakan ejs untuk view engine
app.set('view engine', 'ejs');

//third party middleware
app.use(expressLayouts)


//built in middleware gunakan middleware public agar express dapat mengakses folder static
app.use(express.static('public'));

//built in middleware gunakan url encoded agar aplikasi dapat menerima data yang dikirim dari halaman web
app.use(express.urlencoded({extended: true}))

//konfigurasi flash
app.use(cookieParser('secret'))
app.use(
  session({
    cookie: {maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
)

// Tambahkan middleware connect-flash setelah session
app.use(flash());


//halaman home
app.get('/', (req, res) => {
    res.render('index', {
        layout: 'layouts/main-layout',
        title: 'Home'
      });
});

//halaman about
app.get('/about', (req, res) => {
    res.render('about', {
      layout: 'layouts/main-layout',
      title: 'about'});
});

//halaman contact
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find()
    res.render('contact', {
      layout: 'layouts/main-layout',
      title:'contact',
      contacts,
      msg: req.flash('msg')
    });
});

//halaman detail contact
app.get('/contact/:nama', async (req, res) => {

    const contact = await Contact.findOne({ nama: req.params.nama})
  
    res.render('detail', {
      title: 'Halaman Detail Contact',
      layout: 'layouts/main-layout',
      contact
    })
  })





app.listen(port, () => {
    console.log(`Mongo contact app | listening at http://localhost:${port}`)
})