var pdf = require("html-pdf");
var ejs = require("ejs");

var nome = "Ramom";
var curso = "Ciência da Computação";
var idade = 22;

ejs.renderFile("./print.ejs", {nome: nome, curso: curso, idade: idade }, (err, html) => {
    if(err) console.log(err)
    else{
        pdf.create(html, {}).toFile("../archives/RelatorioDiario.pdf", (err, res)=>{
            if(err) {
                console.log("Erro aconteceu", err);
            } else {
                console.log(res)
            }
        })
    } 
})

