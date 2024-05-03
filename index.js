const connectToMongo = require('./db');
const express = require('express');
var cors = require('cors');

connectToMongo();

const app = express();
const port = 111;

app.use(cors());
app.use(express.json());

//Available Route
app.use('/api/auth', require('./routes/auth'));

app.listen(port, () => {
  console.log(` app listening at http://localhost:${port}`)
});