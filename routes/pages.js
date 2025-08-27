// routes/pages.js
const express = require('express');
const pool    = require('../db');
const router  = express.Router();

router.get('/', async (_req, res) => {
  const [employees] = await pool.query('SELECT * FROM employees');
  const [devices]   = await pool.query('SELECT * FROM devices');
  res.render('home', { employees, devices });
});
router.get('/allocate',    (_req, res) => res.render('1-allocate'));
router.get('/deallocate',  (_req, res) => res.render('2-deallocate'));
router.get('/allocations', (_req, res) => res.render('3-allocations'));
module.exports = router;
