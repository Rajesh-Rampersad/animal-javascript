// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const Jwt = require('jsonwebtoken');
// const expressJwt = require('express-jwt')

// mongoose.connect('mongodb://localhost:27017/my-app-db', { useNewUrlParser: true, useUnifiedTopology: true });

// const User = require('./user.model');
// const port = 3000;

// const validateJwt = expressJwt({ secret: process.env.SECRET, algorithms: ['HS256'] });
// const signToken = _id => Jwt.sign({ _id }, process.env.SECRET);
// const findAndAssignUser = async (req, res, next) => {
//     try {
//         const user = await User.findById(req.user._id);
//         if (!user) {
//             return res.status(404).send('Usuario no encontrado');
//         }
//         req.user = user
//         next()
//     } catch (e) {
//         res.status(500).send(e.message)
//     }
// }

// const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser);

// const Auth = {
//     login: async (req, res) => {
//         const { body } = req;

//         try {
//             const user = await User.findOne({ email: body.email });
//             if (!user) {
//                 res.status(401).send('Usuario y/o contraseña inválida');
//             } else {
//                 const isMatch = await bcrypt.compare(body.password, user.password);
//                 if (isMatch) {
//                     const signned = signToken(user._id);
//                     res.status(200).send({ signed });
//                 } else {
//                     res.status(401).send('Usuario y/o contraseña inválida');
//                 }
//             }
//         } catch (e) {
//             res.status(500).send(e.message);
//         }
//     },
//     register: async (req, res) => {
//         const { body } = req;

//         try {
//             const isUser = await User.findOne({ email: body.email });
//             if (isUser) {
//                 res.status(400).send('Usuario ya existe!');
//             } else {
//                 const salt = await bcrypt.genSalt();
//                 const hashed = await bcrypt.hash(body.password, salt);
//                 const user = await User.create({ email: body.email, password: hashed, salt });

//                 const signed = signToken(user._id);
//                 res.status(201).send({ signed });
//             }
//         } catch (error) {
//             res.status(500).send(error.message);
//         }
//     },
// }

// module.exports = { Auth, isAuthenticated }

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { expressjwt: jwt } = require("express-jwt");
const Jwt = require('jsonwebtoken');
const User = require('./user.model');


const validateJwt = jwt({ secret: "mi-secreto", algorithms: ['HS256'] });


const signToken = _id => Jwt.sign({ _id }, "mi-secreto");

// const findAndAssignUser = async (req, res, next) => {
//     try {
//         req.auth = await User.findById(req.user._id);
//         next();
//     } catch (e) {
//         next(e);
//     }
// };

const findAndAssignUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.auth._id);
        if (!user) {
            return res.status(404).end();
        }
        req.auth = user
        next()
    } catch (e) {
        next(e)
    }
}

// const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser);
const isAuthenticated = express.Router();
isAuthenticated.use(validateJwt, findAndAssignUser);


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
                res.status(409).send('Usuario ya existe!')
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(body.password, salt);
                const user = await User.create({ email: body.email, password: hashed, salt });

                const signed = signToken(user._id);
                res.send(signed);
            }
        } catch (error) {
            res.status(500).send(error.message)

        }
    },
}

module.exports = { Auth, isAuthenticated }