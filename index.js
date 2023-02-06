const express = require("express");
const ejs = require("ejs");
const fs = require("fs");
// const sass = require("sass");
const sharp = require("sharp");
const {Client} = require("pg");

var client = new Client({database:"cofetarie",
    user:"ruxi",
    password:"admin",
    host:"localhost",
    port:5432});
client.connect();

client.query("select * from unnest(enum_range(null::categ_prajitura ))", function(err, rez) {
    if(err)
        console.log(err);
    else
        console.log(rez);
});

app = express();

app.set("view engine","ejs");
app.use("/resources", express.static(__dirname + "/resources"));

obGlobal = {
    erori: null,
    imagini: null
}

function createImages() {
    var continutFisier = fs.readFileSync(__dirname + "/resources/json/galerie.json").toString("utf8");
    var obiect = JSON.parse(continutFisier);
    var dim_mediu = 250;
    var dim_mic = 100;

    obGlobal.imagini = obiect.imagini;

    obGlobal.imagini.forEach(function(elem) {
        [numeFisier, extensie] = elem.fisier.split(".");
        if(!fs.existsSync(obiect.cale_galerie + "/mediu/")) {
            fs.mkdirSync(obiect.cale_galerie + "/mediu/");
        } 
        if(!fs.existsSync(obiect.cale_galerie + "/mic/")) {
            fs.mkdirSync(obiect.cale_galerie + "/mic/");
        }

        elem.fisier_mediu = obiect.cale_galerie + "/mediu/" + numeFisier + ".webp";
        elem.fisier_mic = obiect.cale_galerie + "/mic/" + numeFisier + ".webp";
        elem.fisier = obiect.cale_galerie + "/" + elem.fisier;
        sharp(__dirname + "/" + elem.fisier).resize(dim_mediu).toFile(__dirname + "/" + elem.fisier_mediu);
        sharp(__dirname + "/" + elem.fisier).resize(dim_mic).toFile(__dirname + "/" + elem.fisier_mic);
    });
}
createImages()

function createErrors() {
    var continutFisier = fs.readFileSync(__dirname + "/resources/json/erori.json").toString("utf8");
    obGlobal.erori = JSON.parse(continutFisier);
}
createErrors()

function renderError(res, identificator, titlu, text, imagine) {
    var eroare = obGlobal.erori.info_erori.find(function (elem) {
        return elem.identificator == identificator;
    })
    titlu = titlu || (eroare && eroare.titlu) || obGlobal.erori.eroare_default.titlu;
    text = text || (eroare && eroare.text) || obGlobal.erori.eroare_default.text;
    imagine = imagine || (eroare && obGlobal.erori.cale_baza + "/" + eroare.imagine) || obGlobal.erori.cale_baza + "/" + obGlobal.erori.eroare_default.imagine;
    if (eroare && eroare.status) {
        res.status(identificator).render("pages/eroare", { titlu: titlu, text: text, imagine: imagine })
    }
    else {
        res.render("pages/eroare", { titlu: titlu, text: text, imagine: imagine });
    }
}

app.get(["/", "/index", "/home"], function(req,res){
    res.render("pages/index", { ip: res.socket.remoteAddress, imagini: obGlobal.imagini });
});

app.get("/produse", function(req,res){
    client.query("select * from unnest(enum_range(null::categ_prajitura ))", function(err, rezCateg) {
        client.query("select * from prajituri", function(err, rez){
            if(err)
                renderError(res,2);
            else
                res.render("pages/produse", { produse: rez.rows, optiuni: rezCateg.rows});
        });
    });
});

app.get("/produs/:id", function(req,res){
    client.query("select * from prajituri where id=" + req.params.id, function(err, rez){
        if(err)
            renderError(res,2);
        else
            res.render("pages/produs", { prod: rez.rows[0] });
    });
    
});

app.get("/despre", function(req,res){
    res.render("pages/despre");
});

app.get("/*.ejs", function (req, res) {
    renderError(res, 403, "Error 403");
});

app.get("/*", function (req, res) {
    res.render("pages" + req.url, { ip: res.socket.remoteAddress }, function (err, rez) {
        console.log(err);
        if (err) {
            renderError(res, 404, "Error 404");
            res.status(404).send();
        }
        else {
            res.send(rez);
        }
    })
});

// app.get("*/galerie-animata.css", function(req, res){
//     var sirScss=fs.readFileSync(__dirname+"/resources/scss/galerie-animata.scss").toString("utf8");
//     var nrAleator=Math.floor(Math.random()*15 + 1); 
//     while(![2,4,8,16].includes(nrAleator)) {
//         nrAleator=Math.floor(Math.random()*15 + 1); 
//     }
//     rezScss=ejs.render(sirScss,{nrImagini:nrAleator});
//     //console.log(rezScss);
//     var caleScss=__dirname+"/temp/galerie-animata.scss"
//     fs.writeFileSync(caleScss,rezScss);
//     try {
//         rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
//         var caleCss=__dirname+"/temp/galerie-animata.css";
//         fs.writeFileSync(caleCss,rezCompilare.css);
//         res.setHeader("Content-Type","text/css");
//         res.sendFile(caleCss);
//     }
//     catch (err){
//         console.log(err);
//         res.send("Eroare");
//     }
// });

// app.get("*/galerie-animata.css.map",function(req, res){
//     res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
// });


app.listen(8080, function() {
    console.log("Serverul a pornit");
});