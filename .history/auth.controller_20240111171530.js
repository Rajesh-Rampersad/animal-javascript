const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt')
// const { expressjwt: jwt } = require("express-jwt");
const User = require('./user.model');
const port = 3000;

const validateJwt = expressJwt({ secret: process.env.SECRET, algorithms: ['HS256'] });
const signToken = _id => Jwt.sign({ _id }, process.env.SECRET);
const findAndAssignUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).end();
        }
        req.user = user
        next()
    } catch (e) {
        next(e)
    }
}

const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser);

const Auth = {
    login: async (req, res) => {
        const { body } = req
        try {
            const user = await User.findOne({ email: body.email });
            if (!user) {
                res.status(401).send('Usuario y/o contraseña invalida');
            } else {
                const isMatch = await bcrypt.compare(body.password, user.password);
                if (isMatch) {
                    const signned = signToken(user._id)
                    res.status(401).send('Usuario y/o contraseña invalida')
                }
            }

        } catch (e) {
            res.send(e.massage)

        }
    },
    register: async (req, res) => { },
}

module.exports = { Auth, isAuthenticated }