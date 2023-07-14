const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()

const path = require('path');
global.__basedir = path.resolve(__dirname);

const port = process.env.PORT || 8000;

var corOption = {
    origin: `http://localhost:${4200}`
}

//middelware
app.use(cors(corOption));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//routers
const messages = require('./router/messages.js')
app.use('/api/messages',messages)


app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`);
});

