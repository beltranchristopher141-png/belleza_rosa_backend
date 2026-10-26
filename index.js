require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: true }));
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'belleza_rosa',
  port: Number(process.env.DB_PORT || 3306),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true
});

const query = (sql, params=[]) => new Promise((resolve,reject) =>
  db.query(sql, params, (err, result) => err ? reject(err) : resolve(result))
);
const asyncRoute = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

app.get('/api/health', asyncRoute(async (req,res) => {
  await query('SELECT 1');
  res.json({ok:true, message:'API y MySQL conectados', database:process.env.DB_NAME || 'belleza_rosa'});
}));

// PRODUCTOS: CRUD completo
app.get('/api/productos', asyncRoute(async (req,res) => {
  const rows = await query('SELECT * FROM productos WHERE activo=1 ORDER BY id DESC');
  res.json(rows);
}));
app.post('/api/productos', asyncRoute(async (req,res) => {
  const {nombre,categoria='Rostro',descripcion='',precio,stock=0,imagen=''} = req.body;
  if (!nombre || !Number.isFinite(Number(precio)) || Number(precio)<0 || !Number.isInteger(Number(stock)) || Number(stock)<0)
    return res.status(400).json({message:'Nombre, precio válido y stock entero no negativo son obligatorios.'});
  const r = await query('INSERT INTO productos(nombre,categoria,descripcion,precio,stock,imagen) VALUES(?,?,?,?,?,?)',
    [nombre,categoria,descripcion,Number(precio),Number(stock),imagen]);
  res.status(201).json({id:r.insertId,message:'Producto creado'});
}));
app.put('/api/productos/:id', asyncRoute(async (req,res) => {
  const {nombre,categoria,descripcion='',precio,stock=0,imagen=''} = req.body;
  if (!nombre || !Number.isFinite(Number(precio)) || Number(precio)<0 || !Number.isInteger(Number(stock)) || Number(stock)<0)
    return res.status(400).json({message:'Revisa nombre, precio y stock.'});
  const r = await query('UPDATE productos SET nombre=?,categoria=?,descripcion=?,precio=?,stock=?,imagen=? WHERE id=?',
    [nombre,categoria,descripcion,Number(precio),Number(stock),imagen,req.params.id]);
  if (!r.affectedRows) return res.status(404).json({message:'Producto no encontrado'});
  res.json({message:'Producto actualizado'});
}));
app.delete('/api/productos/:id', asyncRoute(async (req,res) => {
  const r = await query('UPDATE productos SET activo=0 WHERE id=?',[req.params.id]);
  if (!r.affectedRows) return res.status(404).json({message:'Producto no encontrado'});
  res.json({message:'Producto eliminado del catálogo'});
}));

// EMPLEADOS: CRUD completo
app.get('/api/empleados', asyncRoute(async (req,res) => res.json(await query('SELECT * FROM empleados ORDER BY id DESC'))));
app.post('/api/empleados', asyncRoute(async (req,res) => {
  const {nombre,turno='Completo'}=req.body;
  if(!nombre) return res.status(400).json({message:'El nombre es obligatorio'});
  const r=await query('INSERT INTO empleados(nombre,turno) VALUES(?,?)',[nombre,turno]);
  res.status(201).json({id:r.insertId,message:'Empleado creado'});
}));
app.put('/api/empleados/:id', asyncRoute(async (req,res) => {
  const {nombre,turno}=req.body;
  if(!nombre) return res.status(400).json({message:'El nombre es obligatorio'});
  const r=await query('UPDATE empleados SET nombre=?,turno=? WHERE id=?',[nombre,turno,req.params.id]);
  if(!r.affectedRows) return res.status(404).json({message:'Empleado no encontrado'});
  res.json({message:'Empleado actualizado'});
}));
app.delete('/api/empleados/:id', asyncRoute(async (req,res) => {
  const r=await query('DELETE FROM empleados WHERE id=?',[req.params.id]);
  if(!r.affectedRows) return res.status(404).json({message:'Empleado no encontrado'});
  res.json({message:'Empleado eliminado'});
}));

// VENTAS: JOIN de ventas con empleado y detalles
app.get('/api/ventas', asyncRoute(async (req,res) => {
  const rows=await query(`
    SELECT v.id,v.cliente,v.total,v.fecha,e.nombre AS empleado,
    GROUP_CONCAT(CONCAT(d.nombre_producto,' × ',d.cantidad) SEPARATOR ', ') AS articulos
    FROM ventas v LEFT JOIN empleados e ON v.empleado_id=e.id
    LEFT JOIN detalle_ventas d ON d.venta_id=v.id
    GROUP BY v.id ORDER BY v.fecha DESC`);
  res.json(rows);
}));
app.post('/api/ventas', asyncRoute(async (req,res) => {
  const {items,cliente='Cliente de tienda',empleado_id=null}=req.body;
  if(!Array.isArray(items)||!items.length) return res.status(400).json({message:'El carrito está vacío'});
  const connection=db.promise();
  const conn=await connection.getConnection();
  try {
    await conn.beginTransaction();
    let total=0, validated=[];
    for(const item of items){
      const qty=Number(item.cantidad);
      if(!Number.isInteger(qty)||qty<1) throw new Error('Cantidad inválida');
      const [rows]=await conn.query('SELECT id,nombre,precio,stock FROM productos WHERE id=? AND activo=1 FOR UPDATE',[item.producto_id]);
      if(!rows.length) throw new Error('Uno de los productos ya no está disponible');
      const p=rows[0];
      if(p.stock<qty) throw new Error(`Stock insuficiente para ${p.nombre}`);
      const price=Number(p.precio), subtotal=price*qty;
      total+=subtotal; validated.push({p,qty,price,subtotal});
    }
    const [sale]=await conn.query('INSERT INTO ventas(empleado_id,total,cliente) VALUES(?,?,?)',[empleado_id || null,total,cliente]);
    for(const line of validated){
      await conn.query('INSERT INTO detalle_ventas(venta_id,producto_id,nombre_producto,cantidad,precio_unitario,subtotal) VALUES(?,?,?,?,?,?)',
        [sale.insertId,line.p.id,line.p.nombre,line.qty,line.price,line.subtotal]);
      await conn.query('UPDATE productos SET stock=stock-? WHERE id=?',[line.qty,line.p.id]);
    }
    await conn.commit();
    res.status(201).json({message:'¡Compra registrada correctamente!',venta_id:sale.insertId,total});
  } catch(e) {
    await conn.rollback();
    res.status(400).json({message:e.message || 'No se pudo registrar la venta'});
  } finally { conn.release(); }
}));
app.delete('/api/ventas/:id', asyncRoute(async (req,res) => {
  const r=await query('DELETE FROM ventas WHERE id=?',[req.params.id]);
  if(!r.affectedRows) return res.status(404).json({message:'Venta no encontrada'});
  res.json({message:'Venta eliminada'});
}));

app.use((err,req,res,next)=>{
  console.error(err);
  res.status(500).json({message:'Error en el servidor. Revisa la conexión con MySQL y los datos enviados.'});
});
app.listen(PORT,()=>console.log(`Belleza Rosa API activa en http://localhost:${PORT}`));
