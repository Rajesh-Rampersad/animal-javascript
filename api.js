const express = require('express')
const mongoose = require('mongoose')
const app = express()
const Animal = require('./animal.controller')
const { Auth, isAuthenticated } = require('./auth.controller');

const port = 4000

mongoose.connect('mongodb+srv://danigarcianegocio:Curitiba2024@cluster0.rmrtaxd.mongodb.net/animal?retryWrites=true&w=majority')
// mongoose.connect('mongodb+srv://danigarcianegocio:Curitiba2024@cluster0.rmrtaxd.mongodb.net/animal?retryWrites=true&w=majority')
//   .then(() => {
//     console.log('Conexión a MongoDB exitosa');
//     app.listen(port, () => {
//       console.log(`Server running at http://localhost:${port}`);
//     });
//   })
//   .catch(error => {
//     console.error('Error al conectar a MongoDB:', error.message);
//   });

app.use(express.json())

app.get('/animals', isAuthenticated, Animal.list)
app.post('/animals', isAuthenticated, Animal.create)
app.put('/animals/:id', isAuthenticated, Animal.update)
app.patch('/animals/:id', isAuthenticated, Animal.update)
app.delete('/animals/:id', isAuthenticated, Animal.destroy)

// Route to authenticate a user.
app.post('/login', Auth.login)
// Protect all routes below with authentication middleware.
app.post('/register', Auth.register)

app.use(express.static('app'))

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/index.html`)
})
app.get('*', (req, res) => {
	res.status(404).send('Esta página no existe :(')
})

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
