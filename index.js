const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

//Database

connection
    .authenticate()
    .then(() => {
        console.log("conexao realizada com sucesso");
    })
    .catch((msgErro)=>{
        console.log(msgErro);
    })

//Estou dizendo para o Express usar o EJS como View Engine
app.set('view engine','ejs');
//Adicionando arquivos estaticos na pasta public
app.use(express.static('public'));
//Body parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Rota da página inicial
app.get("/",(req,res)=>{
    Pergunta.findAll({raw: true, order:[
        ['id','DESC']
    ]}).then(perguntas =>{
        //console.log(perguntas);
        res.render("index",{
            perguntas: perguntas
        });
    });
});

app.get("/perguntar",(req,res)=>{
    res.render("perguntar"); 
})

app.post("/salvarpergunta",(req,res)=>{
    //o objeto body é disponibilizado pelo bodyparses
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;
    //Salvando os dados na tabela
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(()=>{
        console.log('pergunta salva');
        //redireciona para a pagina principal
        res.redirect("/");
    });
});

app.get("/pergunta/:id",(req,res)=>{
    var id = req.params.id;
    Pergunta.findOne({
        where: {id:id}
    }).then(pergunta =>{
        if(pergunta != undefined){//pergunta encontrada

            Resposta.findAll({
                where: {perguntaId: pergunta.id},
                order:[
                        ['id','DESC']
                ]
            }).then(respostas=>{
                res.render("pergunta",{
                    pergunta: pergunta,
                    respostas: respostas
                });
            });
        }else{//nao encontrada
            res.redirect("/");
        }
    });
});

app.post("/responder",(req,res)=>{
    var corpo = req.body.corpo;
    var perguntaId = req.body.pergunta;
    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(()=>{
        res.redirect("/pergunta/"+perguntaId);
    });

});

app.listen(8080,()=>{console.log("App Rodando!");});
