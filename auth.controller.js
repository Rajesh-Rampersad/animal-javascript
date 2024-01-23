const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const User = require('./user.model');

const validateJwt = expressJwt({ secret: "mi-secreto", algorithms: ['HS256'] });

const signToken = _id => jwt.sign({ _id }, "mi-secreto");

const findAndAssignUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(401).end()
        }
        req.user = user
        next();
    } catch (e) {
        next(e)

    }
}

const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser);

const Auth = {
    login: async (req, res) => {
        const { body } = req
        try {
            const user = await User.findOne({ email: body.email })
            if (!user) {
                return res.status(401).send('Email o contraseña inválida')
            } else {
                const validPassword = await bcrypt.compareSync(body.password, user.password)
                if (validPassword) {
                    const signed = signToken(user._id)
                    res.status(200).send(signed)
                } else {
                    return res.status(401).send('Email o contraseña inválida')
                }
            }
        } catch (e) {
            res.send(e.message)

        }
    },

    register: async (req, res) => {
        const { body } = req
        try {
            const isUser = await User.findOne({ email: body.email })
            if (isUser) {
                res.send("El usuario ya existe")
            } else {
                const salt = await bcrypt.genSalt(10)
                const hashed = await bcrypt.hash(body.password, salt)
                const user = await User.create({ email: body.email, password: hashed, salt })
                const signed = signToken(user._id)
                res.send(signed)
            }
        } catch (e) {
            res.status(500).send(e.message)

        }
    },
}

module.exports = { Auth, isAuthenticated }