const express = require('express')
const mongoose = require('mongoose')
const route = require('./routes/routes.js')

const app = express();

mongoose.connect("mongodb://mongo:27017/DBTechincalTest_Rezida");
const db = mongoose.connection;
db.on('error', (error)=> console.error(error));
db.once('open', ()=> console.log('Database Connected'));

app.use(express.json());
app.use('/', route);
app.use('/login', route);

app.listen('3000', ()=> console.log('Server Runing at port: 3000'));