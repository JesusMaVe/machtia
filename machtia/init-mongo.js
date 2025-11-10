// init-mongo.js
db = db.getSiblingDB('nahuatl_db');

// Crear usuario para la aplicación
db.createUser({
	user: 'nahuatl_user',
	pwd: 'nahuatl_pass',
	roles: [
		{
			role: 'readWrite',
			db: 'nahuatl_db'
		}
	]
});

// Crear colecciones iniciales
db.createCollection('usuarios');
db.createCollection('lecciones');

print('Base de datos y usuario creados correctamente');
