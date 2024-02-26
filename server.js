const express = require('express');
const bodyParser = require('body-parser');
const jwtToken = require('jsonwebtoken');
const exjwt = require('express-jwt');

const app = express();
const path = require('path');
const port = 3000;
const secretKey = 'My super';

const jwtMW = exjwt.expressjwt({
    secret: secretKey,
    algorithms: ['HS256']
});


const users = [
    {
        id: 1,
        username: 'Anjali',
        password: '673'
    },
    {
        id: 2,
        username: 'Anju',
        password: '123'

    } ];

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/**
 *  here we are serving index.html
 *  */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 *  Serving static dashboard.html file
 *  */
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

/**
 *  Serving static dashboard.html file
 *  */
app.get('/settings', (req, res) => {    
    res.sendFile(path.join(__dirname, 'settings.html'));
});


/**
 * Get dashboard API that needs a valid JWT token
 * Verify the token and return the data 
 * If the token is valid, it will return data as MYContent
 * 
 * */
app.get('/api/dashboard', jwtMW, (req, res) => {
    jwtToken.verify(req.token, secretKey, (err, decoded) => {
        if (err) {
            res.status(401).json({
                success: false,
                officialError: err,
                err: 'Username or password is incorrect 2'
            });
        }
        else {
            res.json({
                success: true,
                myContent: 'Secret content that only logged in people can see!!!'
            });
        }
    });
});

/**
 * Get Prices API that needs a valid JWT token
 * */

app.get('/api/prices', jwtMW, (req, res) => {
    jwtToken.verify(req.token, secretKey, (err, decoded) => {
        if (err) {
            res.status(401).json({
                success: false,
                officialError: err,
                err: 'Username or password is incorrect '
            });
        } else {
            res.json({
                success: true,
                myContent: 'there are different prices each'
            });
        }
    });
});

/**
 * Verify the token and return the data 
 * */

app.get('/api/settings', jwtMW, (req, res) => {
    jwtToken.verify(req.token, secretKey, (err, decoded) => {
        if (err) {
            res.status(401).json({
                success: false,
                officialError: err,
                err: 'Username or password is incorrect '
            });
        }
        else {
            res.json({
                success: true,
                myContent: 'This is the settings page. It is only visible to logged in Users.'
            });
        }
    });
});


/**
 *  return a JWT token upon successful login
 * */

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    for (let user of users) {
        if (username === user.username && password === user.password) {
            let token = jwtToken.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m'});
            res.json({
                success: true,
                err: null,
                token: token,
                username: user.username
            });

            break;
        }
        else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
            return;
        }
    }
});

/**
 *  Handling unauthorized Error
 * */

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect'
        });
        return;
    }
    else {
        next(err);
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
