const express = require('express');
const { User } = require('../auth-service/models');
const { asyncRoute } = require('../lib/http');

const router = express.Router();

router.get('/users', asyncRoute(async (req, res) => {
  res.json(await User.findAll({
    attributes: { exclude: ['passwordHash'] },
    order: [['createdAt', 'DESC']]
  }));
}));

module.exports = router;

