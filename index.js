// index.js
const fastify = require('fastify')({ logger: true });

const mongo = process.env.MONGO_URL || "mongodb://localhost:27018/tasks"
fastify.register(require('@fastify/mongodb'), {
    forceClose: true,
    url: mongo
})

const port = process.env.PORT

// Routes CRUD pour les tâches
fastify.post('/tasks', async (request, reply) => {
  const { nom, description, statut, dateCreation } = request.body;

  const db = fastify.mongo.db;
  const collection = db.collection('tasks');

  const result = await collection.insertOne({
    nom,
    description,
    statut,
    dateCreation,
  });

  reply.code(201).send(result);
});

fastify.get('/tasks', async (request, reply) => {
  const db = fastify.mongo.db;
  const collection = db.collection('tasks');

  const tasks = await collection.find().toArray();

  reply.send(tasks);
});

fastify.get('/tasks/:id', async (request, reply) => {
  const taskId = request.params.id;

  const db = fastify.mongo.db;
  const collection = db.collection('tasks');

  const task = await collection.findOne({ _id: new fastify.mongo.ObjectId(taskId) });

  if (!task) {
    reply.code(404).send({ message: 'Tâche non trouvée' });
    return;
  }

  reply.send(task);
});

fastify.put('/tasks/:id', async (request, reply) => {
  const taskId = request.params.id;
  const { nom, description, statut, dateCreation } = request.body;

  const db = fastify.mongo.db;
  const collection = db.collection('tasks');

  const result = await collection.findOneAndUpdate(
    { _id: new fastify.mongo.ObjectId(taskId)},
    { $set: { nom, description, statut, dateCreation } },
    { returnDocument: 'after' }
  );

  if (!result.value) {
    reply.code(404).send({ message: 'Tâche non trouvée' });
    return;
  }

  reply.send(result.value);
});

fastify.delete('/tasks/:id', async (request, reply) => {
  const taskId = request.params.id;

  const db = fastify.mongo.db;
  const collection = db.collection('tasks');

  const result = await collection.findOneAndDelete({ _id: new fastify.mongo.ObjectId(taskId) });

  if (!result.value) {
    reply.code(404).send({ message: 'Tâche non trouvée' });
    return;
  }

  reply.send({ message: 'Tâche supprimée avec succès' });
});

fastify.listen({ port }, (err) => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  })