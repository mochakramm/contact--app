const express = require('express') //versi 4.17.1  & install ejs versi 3.1.6
const expressLayouts = require('express-ejs-layouts') // versi 2.5.0

const {body, validationResult, check} = require('express-validator') //versi 6.12.0
const methodOverride = require('method-override')//versi 3.0.0

const session = require('express-session') //versi 1.17.2
const cookieParser = require('cookie-parser') // versi 1.4.5
const flash = require('connect-flash') // versi 0.1.1

require('./utils/db')
const Contact = require('./model/contact')


const app = express()

const port = 3000


app.use(methodOverride('_method'))

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

//halaman tambah data contact

app.get('/contact/add', (req, res) => {
  res.render('add-contact',{
    layout: 'layouts/main-layout',
    title: 'halaman tambah contact'
  })
})


//halaman setelah proses input data contact
app.post('/contact',  [

  body('nama').custom( async (value) => {

    const duplikat = await Contact.findOne({ nama: value })
    
    if (duplikat) {

      throw new Error ('nama contact sudah digunakan! ');
      
      
    }

    return true

  }),

  check('noHP', 'Nomor handphone tidak valid!').isMobilePhone('id-ID'),
  check('email','Email tidak valid! ').isEmail(),
] ,(req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.render('add-contact', {
      layout: 'layouts/main-layout',
      title: 'form tambah data contact',
      errors: errors.array()
    })
  } else {

    Contact.insertMany(req.body, (error, result) => {
      //kirimkan flash message
      req.flash('msg','data contact berhasil ditambahkan!')
      res.redirect('/contact')
    })

  }

})

// // rute proses delete contact 

// app.get('/contact/delete/:nama', async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama})

//   // jika contact tidak ada

//   if (!contact) {
    
//     res.status(404)
//     res.send('<h1>404</h1>')

//   } else {

//     Contact.deleteOne({_id: contact._id}).then((result) => {

//       req.flash('msg','data contact berhasil dihapus!')
//       res.redirect('/contact')

//     })


//   }


// })

app.delete('/contact', (req, res) => {

    Contact.deleteOne({nama: req.body.nama}).then((result) => {

    req.flash('msg','data contact berhasil dihapus!')
    res.redirect('/contact')
    })
})

app.get('/contact/edit/:nama', async (req, res) => {

  const contact = await Contact.findOne({nama : req.params.nama})

  res.render('edit-contact',{
    layout: 'layouts/main-layout',
    title: 'halaman ubah data contact',
    contact
  })
})


app.put(
  '/contact',  
  [

  body('nama').custom( async (value, {req} ) => {

    const duplikat = await Contact.findOne({ nama: value })
    
    if (value !== req.body.oldnama && duplikat) {

      throw new Error ('nama contact sudah digunakan! ');
      
      
    }

    return true

  }),

  check('noHP', 'Nomor handphone tidak valid!').isMobilePhone('id-ID'),
  check('email','Email tidak valid! ').isEmail(),
] ,(req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.render('edit-contact', {
      layout: 'layouts/main-layout',
      title: 'form tambah data contact',
      errors: errors.array(),
      contact: req.body, 
    })
  } else {
    Contact.updateOne(
      {
        _id: req.body._id
      },
      {
        $set: {
          nama : req.body.nama,
          noHP : req.body.noHP,
          email : req.body.email
        }
      }
    ).then((result) => {
      //kirimkan flash message
      req.flash('msg','data contact berhasil diubah')
      res.redirect('/contact')

    })

  }

})


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