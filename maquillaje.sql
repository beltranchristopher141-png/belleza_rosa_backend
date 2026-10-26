CREATE DATABASE IF NOT EXISTS belleza_rosa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE belleza_rosa;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  categoria ENUM('Rostro','Labios','Ojos','Uñas','Brochas','Cuidado de piel','Accesorios') NOT NULL DEFAULT 'Rostro',
  descripcion VARCHAR(500) DEFAULT '',
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  imagen VARCHAR(500) DEFAULT '',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS empleados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  turno ENUM('Mañana','Tarde','Noche','Completo') NOT NULL DEFAULT 'Completo',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empleado_id INT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cliente VARCHAR(120) DEFAULT 'Cliente de tienda',
  FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NULL,
  nombre_producto VARCHAR(120) NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
);

INSERT INTO productos (nombre,categoria,descripcion,precio,stock,imagen) VALUES
('Velvet Rose Lipstick','Labios','Labial cremoso con acabado elegante y color intenso.',7.50,24,'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=85'),
('Glow Serum','Cuidado de piel','Sérum ligero para completar tu rutina de cuidado.',12.90,18,'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=900&q=85'),
('Blush Petal','Rostro','Rubor suave para un toque fresco y natural.',8.25,20,'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=900&q=85'),
('Dream Eyes Palette','Ojos','Paleta de tonos cálidos para looks de día y noche.',15.00,12,'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=85'),
('Soft Touch Brushes','Brochas','Set de brochas suaves para difuminar y aplicar.',11.50,10,'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85'),
('Nude Gloss','Labios','Brillo labial transparente con tono nude.',6.00,30,'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=900&q=85'),
('Daily Sunscreen','Cuidado de piel','Protección diaria para complementar tu rutina.',9.75,15,'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85'),
('Cherry Nail Polish','Uñas','Esmalte rojo cereza de acabado brillante.',4.50,22,'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=85');

INSERT INTO empleados (nombre, turno) VALUES
('Valeria Martínez','Mañana'),
('Camila Hernández','Tarde');
