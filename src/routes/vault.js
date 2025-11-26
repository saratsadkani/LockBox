const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getItems, createItem, updateItem, deleteItem } = require('../controllers/vaultController');

// Protect all vault routes
router.use(authMiddleware);

router.get('/items', getItems);
router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

module.exports = router;
