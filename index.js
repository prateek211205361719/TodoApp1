
const express = require("express");
const mongoose = require("mongoose");
const { ObjectID } = require('mongodb');
const bodyParser = require('body-parser');
const keys = require('./server/config/keys');
const _ = require("lodash");

const app = express();
app.use(bodyParser.json());
mongoose.connect(keys.mongoURI);
const { Todo } = require('./server/models/todo');


//get all list
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
app.delete('/todos/:id', async (req, res) => {
    var id = req.params.id;
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

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('------------running----------');
});
