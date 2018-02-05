
const express = require("express");
const mongoose = require("mongoose");
const { ObjectID } = require('mongodb');
const bodyParser = require('body-parser');
const keys = require('./server/config/keys');
const _ = require("lodash");
var jsforce = require('jsforce');
const session = require('express-session');
const hbs = require('hbs')
const app = express();
const xmlparser = require('express-xml-bodyparser');
app.use(xmlparser());

app.set('view engine', hbs);
app.use(bodyParser.json());
app.use(session({secret: 'S3CRE7', resave: true, saveUninitialized: true}));
mongoose.connect(keys.mongoURI);
const { Todo } = require('./server/models/todo');

oauth2 = new jsforce.OAuth2({
    loginUrl:'https://login.salesforce.com', 
    clientId : keys.clientId,
    clientSecret : keys.clientSecret,
    redirectUri : 'http://localhost:5000/oauth2/callback'
});

//get all list

  
   app.get('/', function(req, res){
        res.render('home.hbs');
   });

    app.get('/todos', async (req, res) => {
        try{
            var todos = await Todo.find();
            if(todos){
                res.send(todos);
            }
            }catch(e){
                res.status(400).send(e); 
            }
    });
  app.get("/auth/login", function(req, res) {
    // Redirect to Salesforce login/authorization page
    res.redirect(oauth2.getAuthorizationUrl({scope: 'api id web refresh_token'}));
  });
  app.get("/oauth2/callback", function(req, res) {
        console.log('-------callback-------');
        const conn = new jsforce.Connection({oauth2: oauth2});
        const code = req.query.code;
        conn.authorize(code, function(err, userInfo) {
            req.session.accessToken = conn.accessToken;
            req.session.instanceUrl = conn.instanceUrl;
            req.session.refreshToken = conn.refreshToken;
            res.redirect('/todos');
            
        });
    
    });


//create todo
app.post('/todos', async (req, res) => {
    try{
        var todo = new Todo( _.pick(req.body, ['text']));
        var newTodo = await todo.save();
        if(newTodo){
            res.send(newTodo); 
        }
    }catch(e){
        res.status(400).send();
    }

});

//update todo
app.post("/new_contact", function(req, res) { 
       console.log('hello');
       res.status(200).send();
       /* var notification = req.body["soapenv:envelope"]["soapenv:body"][0]["notifications"][0]; 
        var sessionId = notification["sessionid"][0]; var data = {}; if (notification["notification"] !== undefined) {
        var sobject = notification["notification"][0]["sobject"][0]; Object.keys(sobject).forEach(function(key) { 
        if (key.indexOf("sf:") == 0) { 
            var newKey = key.substr(3); data[newKey] = sobject[key][0]; 
        }*/
 }); 
app.patch('/todos/:id', async (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    var body = _.pick(req.body, ['text','completed']);
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    }else{
        body.completedAt = null;
        body.completed = false;
    }
    try{
       // var updateTodo = await todo.findByIdAndUpdate(id, {$set:body},{new: true});
       var updatedTodo = await Todo.findByIdAndUpdate(id, {$set:body}, {new :true});
        if(!updateTodo){
            return res.status(404).send();
        }
        res.send(updateTodo);
    }catch(e){
        res.status(400).send(e)
    }
  
});

//delete todo
app.get('/todos/:id',isValid, async (req, res) => {
    var id = req.params.id;
    console.log('----------id----'+id);
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    try{
        var todo = await Todo.findByIdAndRemove(id);
        if(!todo){
            return res.status(404).send();
        }
        res.send(todo);
    }catch(e){
        res.status(400).send(e);
    }
});
 function isValid(req, res, next){
    console.log(req.session);
    if (req.session.accessToken && req.session.instanceUrl) { 
        console.log(req.session);
        return next();
    }
    res.redirect('/'); 
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('------------running----------');
});
