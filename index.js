const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const userRoute = require('./routes/userRoute');
const pollRoute = require('./routes/pollRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const cookieParser = require('cookie-parser');
const protect = require('./middleware/protect');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://example.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/users', userRoute);
app.use('/api/polls', pollRoute);

app.get('/', (req, res) => {
  res.send('Homepage');
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
