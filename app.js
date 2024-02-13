const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv'); 

const createError = require('http-errors');

dotenv.config();

require('./helpers/init_mongodb');


const app = express();

app.use(morgan('dev'))

app.use(express.json())

app.use(express.urlencoded({extended: true}));

const AuthRoute = require('./Routes/Auth.route');

const PORT = process.env.PORT || 3000;


app.get('/', async (req, res, next) => {
    res.send('Mustang socho aur mehnat karo')
})


app.use('/auth', AuthRoute)

app.use(async (req, res, next) => {
    // const error = new Error("Not Found");
    // error.status = 404;
    // next(error)
    next(createError.NotFound())
})


app.use(async (err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
})