var express = require("express");
var router = express.Router();
var multer = require("multer");
var path = require("path");

//import database
var connection = require("../library/database");

// Set storage engine
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init upload
var upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("gambar_produk");

function checkFileType(file, cb) {
  var filetypes = /jpeg|jpg|png|gif/;
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  var mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// INDEX POSTS
router.get("/", function (req, res, next) {
  //query
  connection.query("SELECT * FROM posts ORDER BY id ASC", function (err, rows) {
    if (err) {
      req.flash("error", err);
      res.render("posts/index", { data: "" });
    } else {
      res.render("posts/index", { data: rows });
    }
  });
});

// CREATE POST
router.get("/create", function (req, res, next) {
  res.render("posts/create", {
    gambar_produk: "",
    nama_produk: "",
    link: "",
  });
});

// STORE POST
router.post("/store", upload, function (req, res, next) {
  console.log("File:", req.file);
  console.log("Body:", req.body);

  if (!req.file) {
    req.flash("error", "Silakan masukkan gambar_produk");
    console.error("File not found in request");
    return res.redirect("/posts/create");
  }

  var gambar_produk = req.file.filename;
  var { nama_produk, link } = req.body;

  if (!nama_produk || !link) {
    req.flash("error", "Silakan lengkapi semua kolom");
    console.error("Validation Error:", { nama_produk, link, gambar_produk });
    return res.redirect("/posts/create");
  }

  var formData = { gambar_produk, nama_produk, link };
  connection.query("INSERT INTO posts SET ?", formData, function (err, result) {
    if (err) {
      req.flash("error", "Gagal menyimpan data. Silakan coba lagi.");
      console.error("Database Error:", err);
      return res.redirect("/posts/create");
    } else {
      req.flash("success", "Data berhasil disimpan!");
      return res.redirect("/posts");
    }
  });
});

// EDIT POST
router.get("/edit/(:id)", function (req, res, next) {
  let id = req.params.id;

  connection.query(
    "SELECT * FROM posts WHERE id = " + id,
    function (err, rows, fields) {
      if (err) throw err;

      // if user not found
      if (rows.length <= 0) {
        req.flash("error", "Data Post Dengan ID " + id + " Tidak Ditemukan");
        res.redirect("/posts");
      }
      // if book found
      else {
        // render to edit.ejs
        res.render("posts/edit", {
          id: rows[0].id,
          gambar_produk: rows[0].gambar_produk,
          nama_produk: rows[0].nama_produk,
          link: rows[0].link,
        });
      }
    }
  );
});

// UPDATE POST
router.post('/update/:id', function(req, res, next) {
    upload(req, res, function(err) {
        if (err) {
            req.flash('error', 'Error uploading file.');
            console.error('Upload Error:', err);
            return res.redirect('/posts/edit/' + req.params.id);
        }

        let id = req.params.id;
        let nama_produk = req.body.nama_produk;
        let link = req.body.link;
        let old_gambar_produk = req.body.old_gambar_produk;
        let gambar_produk = req.file ? req.file.filename : old_gambar_produk;
        let errors = false;

        console.log('Nama Produk:', nama_produk);
        console.log('Link:', link);
        console.log('Old Gambar Produk:', old_gambar_produk);
        console.log('Gambar Produk:', gambar_produk);

        if (!nama_produk) {
            errors = true;
            req.flash('error', "Silahkan Masukkan Nama Produk");
        }

        if (!link) {
            errors = true;
            req.flash('error', "Silahkan Masukkan Link");
        }

        if (errors) {
            return res.render('posts/edit', {
                id: id,
                nama_produk: nama_produk,
                link: link,
                gambar_produk: old_gambar_produk
            });
        }

        let formData = {
            gambar_produk: gambar_produk,
            nama_produk: nama_produk,
            link: link
        };

        connection.query('UPDATE posts SET ? WHERE id = ?', [formData, id], function(err, result) {
            if (err) {
                req.flash('error', err);
                return res.render('posts/edit', {
                    id: id,
                    nama_produk: nama_produk,
                    link: link,
                    gambar_produk: old_gambar_produk 
                });
            } else {
                req.flash('success', 'Data Berhasil Diupdate!');
                return res.redirect('/posts');
            }
        });
    });
});

// DELETE POST
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;
     
    connection.query('DELETE FROM posts WHERE id = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to posts page
            res.redirect('/posts')
        } else {
            // set flash message
            req.flash('success', 'Data Berhasil Dihapus!')
            // redirect to posts page
            res.redirect('/posts')
        }
    })
});

module.exports = router;
