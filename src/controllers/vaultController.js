const vaultModel = require('../models/vaultModel');

async function getItems(req, res, next) {
  try {
    const userId = req.user.id;
    const items = await vaultModel.getItemsByUserId(userId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function createItem(req, res, next) {
  try {
    const userId = req.user.id;
    const data = req.body;
    const created = await vaultModel.createItem(userId, data);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const data = req.body;
    const updated = await vaultModel.updateItem(userId, id, data);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteItem(req, res, next) {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const ok = await vaultModel.deleteItem(userId, id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getItems, createItem, updateItem, deleteItem };
