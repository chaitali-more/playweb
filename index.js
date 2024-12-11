const express = require("express");
const app = express();
const port = 3000; 
const cors = require("cors");

app.use(express.json());

app.use(cors());
app.use('/api/contact', require('./routes/contact.js  07-12-24'));

app.listen(port, ()=>{
    console.log(`App listening on port number: localhost:${port}`);
});