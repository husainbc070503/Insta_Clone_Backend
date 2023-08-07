require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connectToDb = require('./db/Connection');
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
connectToDb();

app.get('/', (req, res) => res.send("Hello World Instagram Clone"));

app.use('/api/user', require('./routes/User'));
app.use('/api/post', require('./routes/Post'));

app.listen(port, () => console.log(`Server running successfully on port ${port}`));