const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const CLIENTE_SERVICE = 'clienteService';

// Lista todos os clientes
router.get('/', asyncHandler(async (req, res) => {
  res.send(await res.app.get(CLIENTE_SERVICE).getAll());
}));

// Detalha um cliente
router.get('/:id', asyncHandler(async (req, res) => {
  // chama o serviço getById de clientes
  const response = await res.app.get(CLIENTE_SERVICE).getById(req.params.id);
  if (response) {
    // retorna o json contendo  o cliente
    res.send(response);
  } else {
    res.sendStatus(404);
  }
}));

// Insere um cliente
router.post('/', asyncHandler(async (req, res) => {
  res.status(201).send(await res.app.get(CLIENTE_SERVICE).save(req.body));
}));

// Altera um cliente
router.put('/:id', asyncHandler(async (req, res) => {
  const response = await res.app.get(CLIENTE_SERVICE).update(req.params.id, req.body);
  if (response) {
    res.status(200).send(response);
  } else {
    res.sendStatus(404);
  }
}));

// Exclui um cliente
router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await res.app.get(CLIENTE_SERVICE).deleteById(req.params.id);
  res.status(deleted.count == 1 ? 204 : 404).end();
}));

module.exports = router;
