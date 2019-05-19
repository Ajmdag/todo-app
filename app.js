const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const Joi = require('joi');

app.use(bodyParser.json());
const db = require('./db');
const collection = 'todo';

const schema = Joi.object().keys({
    todo: Joi.string().required()
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/getTodos', (req, res) => {
    db.getDB().collection(collection).find({}).toArray((err, documents) => {
        if (err) {
            console.log(err);
        } else {
            console.log(documents);
            res.json(documents);
        }
    });
});

app.put('/:id', (req, res) => {
    const todoID = req.params.id;
    const userInput = req.body;

    db.getDB().collection(collection).findOneAndUpdate(
        {_id: db.getPrimaryKey(todoID)},
        {$set: {todo: userInput.todo}},
        {returnOriginal: false},
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log('QQQQQ', result);
                res.json(result);
            }
    });
});

app.post('/', (req, res, next) => {
    const userInput = req.body;

    Joi.validate(userInput, schema, (err, result) => {
        if (err) {
            const error = new Error('Invalid input');
            error.status = 400;
            next(error);
        } else {
            db.getDB().collection(collection).insertOne(userInput, (err, result) => {
                if (err) {
                    const error = new Error('Failed to insert todo document');
                    error.status = 400;
                    next(error);
                } else {
                    res.send({result: result, document: result.ops[0], msg: 'successfully inserted todo!!!', error: null});
                }
            });
        }
    });
});

app.delete('/:id', (req, res) => {
    const todoID = req.params.id;

    db.getDB().collection(collection).findOneAndDelete({_id: db.getPrimaryKey(todoID)}, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
});

app.use((err,req,res,next)=>{
    res.status(err.status).json({
        error : {
            message : err.message
        }
    });
})

db.connect((err)=>{
    // If err unable to connect to database
    // End application
    if(err){
        console.log('unable to connect to database');
        process.exit(1);
    }
    // Successfully connected to database
    // Start up our Express Application
    // And listen for Request
    else{
        app.listen(3000,()=>{
            console.log('connected to database, app listening on port 3000');
        });
    }
});