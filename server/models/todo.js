
const mongoose = require("mongoose");
const { Schema } = mongoose;

const todoSchema = new Schema({
    text:{
        type:String,
        required:true,
        trim:true,
        minlength:1
    },
    completed:{
        type:Boolean,
        default:false
    },
    completedAt:{
        type:Number,
        default:null
    }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = {
    Todo
}