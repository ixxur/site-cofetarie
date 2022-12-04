const express = require("express");
const ejs = require("ejs");
const fs = require("fs");
const sharp = require("sharp");

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


app.listen(8080, function() {
    console.log("Serverul a pornit");
});