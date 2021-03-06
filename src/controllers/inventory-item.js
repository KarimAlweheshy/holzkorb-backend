'use strict';

const InventoryItemModel = require('../models/inventory-item');
const ProductModel = require('../models/product');
const UserModel = require('../models/user');

const create = (req, res) => {
  console.log(req);
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'The request body is empty',
    });
  } else {
    const inventoryItem = req.body
    inventoryItem.userId = req.user._id
    InventoryItemModel.create(inventoryItem)
      .then(function(inventoryItem) {
        res.status(201).json(inventoryItem) 
      })
      .catch((error) =>
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        })
      );
  }
};

const read = (req, res) => {
  InventoryItemModel.findById(req.params.id)
    .exec()
    .then((inventoryItem) => {
      if (inventoryItem) {
        res.status(200).json(inventoryItem);
      } else {
        res.status(404).json({
          error: 'Not Found',
          message: 'Inventory item not found',
        });
      }
    })
    .catch((error) =>
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      })
    );
};

const update = (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'The request body is empty',
    });
  } else {
    InventoryItemModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .exec()
      .then((inventoryItem) => res.status(200).json(inventoryItem))
      .catch((error) =>
        res.status(500).json({
          error: 'Internal server errror',
          message: error.message,
        })
      );
  }
};

const remove = (req, res) => {
  InventoryItemModel.findByIdAndRemove(req.params.id)
    .exec()
    .then((inventoryItem) =>
      res
        .status(200)
        .json({ message: 'Inventory item with id${req.param.id} was deleted.' })
    )
    .catch((error) =>
      res.status(500).json({
        error: 'Internal server errror',
        message: error.message,
      })
    );
};

const list = (req, res) => {
  InventoryItemModel.find({})
    .exec()
    .then(function(inventoryItems) {
      if (!inventoryItems.length) {
          return res.status(200).json([])
      }
      const productIds = inventoryItems.map(item => item.productId);
      ProductModel.find({ _id: { $in: productIds } })
        .exec()
        .then(function(products) {
          const result = inventoryItems.map(function(inventoryItem) {
            const [assignedProduct] = products.filter(product => product._id == inventoryItem.productId)
            return { inventoryItem, 'product': assignedProduct }
          });
          res.status(200).json(result)
        })
        .catch((error) =>
          res.status(500).json({
            error: 'Internal server errror',
            message: error.message,
          })
        );
    })
    .catch((error) =>
      res.status(500).json({
        error: 'Internal server errror',
        message: error.message,
      })
    );
};

const myList = (req, res) => {
  InventoryItemModel.find({ userId: req.user._id })
    .exec()
    .then((inventoryItems) => res.status(200).json(inventoryItems))
    .catch((error) =>
      res.status(500).json({
        error: 'Internal server errror',
        message: error.message,
      })
    );
};

module.exports = {  
  create,
  read,
  update,
  remove,
  list,
  myList
};
