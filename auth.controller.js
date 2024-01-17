const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
// const expressJwt = require('express-jwt')
const { expressjwt: expressJwt } = require("express-jwt");
const User = require('./user.model');



const validateJwt = expressJwt({ secret: "mi-secreto", algorithms: ['HS256'] });

const signToken = _id => Jwt.sign({ _id }, "mi-secreto");

const findAndAssingUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.auth._id)
        if(!user) {
            return res.status(401).end()
        }
        req.auth = user
        next()
    } catch (e) {
        next(e)
    }
}
 


// const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser);
const isAuthenticated = express.Router();
isAuthenticated.use(validateJwt, findAndAssingUser);


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
                    const signed = signToken(user._id)
                    res.status(200).json({ token: signed })
                }else {
                    res.status(401).send('Contraseña y/o usuario incorrecta')
                }
            }

        } catch (e) {
            res.send(e.message)

        }
    },
 


    register: async (req, res) => {
        const { body } = req
        try {
            const isUser = await User.findOne({ email: body.email });
            if (isUser) {
                return res.status(409).send('Usuario ya existe!')
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(body.password, salt);
                const user = await User.create({ email: body.email, password: hashed, salt });

                const signed = signToken(user._id)
                res.send(signed)
            }
        } catch (error) {
            res.status(500).send(error.message)

        }
    },
}

module.exports = { Auth, isAuthenticated }
