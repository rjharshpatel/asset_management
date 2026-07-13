const express = require('express');
const path    = require('path');
const pool    = require('./db');
const app  = express();
const PORT = process.env.PORT || 3000;
/* Static files */
app.use(express.static(path.join(__dirname, 'public')));
/* View engine setup */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
/* Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/* Logger */
app.use((req, _res, next) => {
  console.info(`${req.method} ${req.url}`);
  next();
});
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
/* Pages */
app.get('/', asyncHandler(async (_req, res) => {
  const [employees] = await pool.query('SELECT * FROM employees');
  const [devices]   = await pool.query('SELECT * FROM devices');
  res.render('home', { employees, devices });
}));
app.get('/allocate', (_req, res) => res.render('1-allocate'));
app.get('/deallocate', (_req, res) => res.render('2-deallocate'));
app.get('/allocations', (_req, res) => res.render('3-allocations'));
/* REST APIs */
app.get('/api/employees', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM employees');
  res.json(rows);
}));
app.get('/api/devices', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM devices');
  res.json(rows);
}));
app.get('/api/available-devices', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM devices WHERE status = 'available'"
  );
  res.json(rows);
}));
app.post('/api/allocate', asyncHandler(async (req, res) => {
  const { employee_id, device_id } = req.body;
  await pool.query(
    `INSERT INTO allocations (employee_id, device_id, allocated_date)
     VALUES (?, ?, CURDATE())`,
    [employee_id, device_id]
  );
  await pool.query(
    'UPDATE devices SET status = "allocated" WHERE device_id = ?',
    [device_id]
  );
  res.json({ message: '✅ Device allocated' });
}));
app.post('/api/deallocate', asyncHandler(async (req, res) => {
  const { device_id } = req.body;
  await pool.query(
    `UPDATE allocations SET return_date = CURDATE()
     WHERE device_id = ? AND return_date IS NULL`,
    [device_id]
  );
  await pool.query(
    "UPDATE devices SET status = 'available' WHERE device_id = ?"
    [device_id]
  );
  res.json({ message: '✅ Device deallocated' });
}));
app.get('/api/allocations', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT a.allocation_id,
           e.name  AS employee,
           d.brand AS brand,
           d.model AS model,
           a.allocated_date
      FROM allocations a
      JOIN employees e ON a.employee_id = e.employee_id
      JOIN devices   d ON a.device_id   = d.device_id
     WHERE a.return_date IS NULL
  `);
  res.json(rows);
}));
/* Add employee/device  */
app.post('/api/employees', asyncHandler(async (req, res) => {
  const { name, department } = req.body;
  await pool.query(
    'INSERT INTO employees (name, department) VALUES (?, ?)',
    [name, department]
  );
  res.json({ message: 'Added successfully' });
}));
app.post('/api/devices', asyncHandler(async (req, res) => {
  const { brand, model, status } = req.body;
  await pool.query(
    'INSERT INTO devices (brand, model, status) VALUES (?, ?, ?)',
    [brand, model, status]
  );
  res.json({ message: 'Added successfully' });
}));
/* Error handlers */
app.use((req, res) =>
  res.status(404).send(`No route for <code>${req.path}</code>.`)
);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send('Internal server error');
});
/* Start server */
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
