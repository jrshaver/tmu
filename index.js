const express = require("express");
const bodyParser = require("body-parser");
const mongojs = require('mongojs');
const util = require("./helpers.js");

const db = mongojs("mongodb://admin:admin@ds139370.mlab.com:39370/tmu", ["tmu"]);

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json(), bodyParser.urlencoded({extended: true}));

app.get("/", (req,res,next) => {
    let errorMessage = "";
    res.render("index", { errorMessage: req.query.error, query: req.query.newUrl });
});

app.get("/api", (req,res,next) => {
    db.tmu.find((err,tmu) => {
        res.send(tmu);
    });
});

app.post("/api", (req,res,next) => {
    //validate user input, return error if not valid
    let originalUrl = req.body.originalUrl;
    if (!util.validateUrl(originalUrl)) {
        res.redirect("/?error=" + "Please enter a valid URL to shorten.  Remember: it must start with 'http://' or 'https://'.");
    }

    let newUrl = "/tmu/" + util.shorten();
    //TODO: check against existing entries

    db.tmu.insert({originalUrl, newUrl});
    //send user to home page with new URL data
    res.redirect("/?newUrl=" + newUrl);
});

//TODO: send redirects upon get requests to urls
app.get("/tmu/:short", (req,res) => {
    const short = req.params.short;
    const thisTmu = db.tmu.findOne({newUrl: mongojs.newUrl(short)});
    console.log(thisTmu);
    res.redirect("/");
});

app.listen(3000, function() {
    console.log("Server started on port 3000 at " + new Date());
});