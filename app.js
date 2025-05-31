import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import sessions from 'express-session';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import apiRouter from './routes/api.js';

import models from './models.js';

import WebAppAuthProvider from 'msal-node-wrapper'

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express();

//TODO: ADD AUTHENTICATION
const authConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: process.env.AUTHORITY,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: 3,
        }
    }
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    req.models = models;
    next();
});

app.enable('trust proxy')
const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: "mysecret",
    cookie: { maxAge: oneDay },
    resave: false,
    saveUninitialized: true,
}))

const authProvider = await WebAppAuthProvider.WebAppAuthProvider.initialize(authConfig);
app.use(authProvider.authenticate());


app.use('/api', apiRouter);

app.get('/signin', (req, res, next) => {
    return req.authContext.login({
        postLoginRedirectUri: "/homepage.html", 
    })(req, res, next);

});
app.get('/signout', (req, res, next) => {
    return req.authContext.logout({
        postLogoutRedirectUri: "/", 
    })(req, res, next);

});

app.use(authProvider.interactionErrorHandler());

export default app;
