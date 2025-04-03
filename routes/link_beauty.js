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
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("gambar_produk");

function checkFileType(file, cb) {
  var filetypes = /jpeg|jpg|png|gifmp4|mkv|avi/;
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  var mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images & Video Only!");
  }
}

// INDEX POSTS
router.get("/", function (req, res, next) {
  //query
  connection.query("SELECT * FROM link_beauty ORDER BY id ASC", function (err, rows) {
    if (err) {
      req.flash("error", err);
      res.render("link_beauty/index", { data: "" });
    } else {
      res.render("link_beauty/index", { data: rows });
    }
  });
});

// CREATE POST
router.get("/create", function (req, res, next) {
  res.render("link_beauty/create", {
    gambar_produk: "",
    nama_produk: "",
    link: "",
    ecommerce: "",
    pic: "",
    status: "",
    insight: "",
  });
});

// STORE POST
router.post("/store", upload, function (req, res, next) {
  console.log("File:", req.file);
  console.log("Body:", req.body);

  if (!req.file) {
    req.flash("error", "Silakan masukkan gambar_produk");
    console.error("File not found in request");
    return res.redirect("/link_beauty/create");
  }

  var gambar_produk = req.file.filename;
  var { nama_produk, link, ecommerce, pic, status, jumlah_view, jumlah_like, jumlah_comment, jumlah_share, komisi } = req.body;

  if (!nama_produk || !link) {
    req.flash("error", "Silakan lengkapi semua kolom");
    console.error("Validation Error:", { nama_produk, link, gambar_produk, ecommerce, pic, status, insight });
    return res.redirect("/link_beauty/create");
  }

  var formData = { gambar_produk, nama_produk, link, ecommerce, pic, status, jumlah_view, jumlah_like, jumlah_comment, jumlah_share, komisi };
  connection.query("INSERT INTO link_beauty SET ?", formData, function (err, result) {
    if (err) {
      req.flash("error", "Gagal menyimpan data. Silakan coba lagi.");
      console.error("Database Error:", err);
      return res.redirect("/link_beauty/create");
    } else {
      req.flash("success", "Data berhasil disimpan!");
      return res.redirect("/link_beauty");
    }
  });
});

// EDIT POST
router.get("/edit/(:id)", function (req, res, next) {
  let id = req.params.id;

  connection.query(
    "SELECT * FROM link_beauty WHERE id = " + id,
    function (err, rows, fields) {
      if (err) throw err;

      // if user not found
      if (rows.length <= 0) {
        req.flash("error", "Data Post Dengan ID " + id + " Tidak Ditemukan");
        res.redirect("/link_beauty");
      }
      // if book found
      else {
        // render to edit.ejs
        res.render("link_beauty/edit", {
          id: rows[0].id,
          gambar_produk: rows[0].gambar_produk,
          nama_produk: rows[0].nama_produk,
          link: rows[0].link,
          ecommerce: rows[0].ecommerce,
          pic: rows[0].pic,
          status: rows[0].status,
          jumlah_view: rows[0].jumlah_view,
          jumlah_like: rows[0].jumlah_like,
          jumlah_comment: rows [0].jumlah_comment,
          jumlah_share: rows [0].jumlah_share,
          komisi: rows[0].komisi,
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
            return res.redirect('/link_beauty/edit/' + req.params.id);
        }

        let id = req.params.id;
        let nama_produk = req.body.nama_produk;
        let link = req.body.link;
        let ecommerce = req.body.ecommerce;
        let pic = req.body.pic;
        let status = req.body.status;
        let jumlah_view = req.body.jumlah_view;
        let jumlah_like = req.body.jumlah_like;
        let jumlah_comment = req.body.jumlah_comment;
        let jumlah_share =req.body.jumlah_share;
        let komisi = req.body.komisi;
        let old_gambar_produk = req.body.old_gambar_produk;
        let gambar_produk = req.file ? req.file.filename : old_gambar_produk;
        let errors = false;

        console.log('Nama Produk:', nama_produk);
        console.log('Link:', link);
        console.log('E-Commerce:', ecommerce);
        console.log('PIC:', pic);
        console.log('Status:', status);
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

        if (!ecommerce) {
            errors = true;
            req.flash('error', "Silahkan Masukkan Nama E-Commerce");
        }

        if (!pic) {
            errors = true;
            req.flash('error', "Silahkan Masukkan Nama PIC");
        }

        if (!status) {
            errors = true;
            req.flash('error', "Silahkan Masukkan Status Konten Tiktok");
        }

       if (!jumlah_view) {
            errors = true;
            req.flash('error', "Silahkan Masukkan Jumlah View Tiktok");
        }

        if (!jumlah_like) {
            errors = true;
            req.flash('error', "Silahkan Masukkan Jumlah Like Tiktok");
        }

        if (!jumlah_comment) {
            errors = true;
            req.flash('error', "Silahkan Masukkan Jumlah Comment Tiktok");
        }

        if (!jumlah_share) {
            errors = true;
            req.flash('error', "Silahkan Masukkan Jumlah Share Tiktok");
        }

        if (!komisi) {
            errors = true;
            req.flash('error', "Silahkan Masukkan Jumlah Komisi");
        }

        if (errors) {
            return res.render('link_beauty/edit', {
                id: id,
                nama_produk: nama_produk,
                link: link,
                ecommerce: ecommerce,
                pic: pic,
                status: status,
                jumlah_view: jumlah_view,
                jumlah_like: jumlah_like,
                jumlah_comment: jumlah_comment,
                jumlah_share: jumlah_share,
                komisi: komisi,
                gambar_produk: old_gambar_produk
            });
        }

        let formData = {
            gambar_produk: gambar_produk,
            nama_produk: nama_produk,
            link: link,
            ecommerce: ecommerce,
            pic: pic,
            status: status,
            jumlah_view: jumlah_view,
            jumlah_like: jumlah_like,
            jumlah_comment: jumlah_comment,
            jumlah_share: jumlah_share,
            komisi: komisi
        };

        connection.query('UPDATE link_beauty SET ? WHERE id = ?', [formData, id], function(err, result) {
            if (err) {
                req.flash('error', err);
                return res.render('link_beauty/edit', {
                    id: id,
                    nama_produk: nama_produk,
                    link: link,
                    ecommerce: ecommerce,
                    pic: pic,
                    status: status,
                    jumlah_view: jumlah_view,
                    jumlah_like: jumlah_like,
                    jumlah_comment: jumlah_comment,
                    jumlah_share: jumlah_share,
                    komisi: komisi,
                    gambar_produk: old_gambar_produk 
                });
            } else {
                req.flash('success', 'Data Berhasil Diupdate!');
                return res.redirect('/link_beauty');
            }
        });
    });
});

// DELETE POST
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;
     
    connection.query('DELETE FROM link_beauty WHERE id = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to posts page
            res.redirect('/link_beauty')
        } else {
            // set flash message
            req.flash('success', 'Data Berhasil Dihapus!')
            // redirect to posts page
            res.redirect('/link_beauty')
        }
    })
});

module.exports = router;
