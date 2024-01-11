const Animals = require('./animal.model')

const Animal = {
	list: async (req, res) => {
		const animals = await Animals.find()
		res.status(200).send(animals)
	},
	create: async (req, res) => {
		const animal = new Animals(req.body)
		await animal.save()
		res.status(201).send('Creado con exito!')
	},
	update: async (req, res) => {
		res.status(204).send('actualizado con exito')
	},
	destroy: async (req, res) => {
		const { id } = req.params;

		try {
			const result = await animal.deleteOne({ _id: id });

			if (result.deletedCount > 0) {
				// Se eliminó al menos un documento, devuelve el código de estado 204
				res.sendStatus(204);
			} else {
				// No se encontró el usuario, devuelve el código de estado 404
				res.sendStatus(404);
			}
		} catch (error) {
			console.error(error);
			// Ocurrió un error en la operación, devuelve el código de estado 500
			res.sendStatus(500);
		}
	}
}

module.exports = Animal
