# BELLEZA ROSA — Tienda de maquillaje

Proyecto escolar full-stack con React + Vite + Axios (frontend), Node.js + Express (backend) y MySQL.

## Estructura
- `backend/`: API REST, conexión MySQL por variables de entorno, CRUD de productos/empleados/ventas.
- `frontend/`: tienda con tarjetas de productos, botón Comprar, carrito lateral y panel administrativo.
- `database/maquillaje.sql`: crea las tablas y carga productos de demostración.

## 1. Requisitos
Instala Node.js LTS, XAMPP (MySQL/MariaDB) y Visual Studio Code. Inicia MySQL desde XAMPP.
En phpMyAdmin (`http://localhost/phpmyadmin`) importa `database/maquillaje.sql`.

## 2. Configurar y arrancar backend
Abre una terminal en `Belleza_Rosa_Proyecto/backend`:
```bash
npm install
```
Crea `backend/.env` copiando `.env.example` y revisa usuario/contraseña de MySQL:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=belleza_rosa
DB_PORT=3306
FRONTEND_URL=http://localhost:5173
```
Ejecuta:
```bash
npm run dev
```
Comprueba `http://localhost:3000/api/health`. Debe responder `{"ok":true,...}`.

## 3. Arrancar frontend
Abre una SEGUNDA terminal en `Belleza_Rosa_Proyecto/frontend`:
```bash
npm install
```
Crea `frontend/.env` a partir de `.env.example`:
```env
VITE_API_URL=http://localhost:3000/api
```
Después ejecuta:
```bash
npm run dev
```
Abre la URL que Vite muestra, normalmente `http://localhost:5173`.

## 4. Cómo funciona
- Tienda: tarjetas, filtros por categoría, botón Comprar, carrito, cantidades y total.
- Al confirmar pedido, se registra una venta en MySQL y se descuenta stock.
- Administración: productos (CRUD), empleados (CRUD) y ventas (consulta/eliminación).
- Los cambios vienen de la API; el carrito es temporal en el navegador hasta confirmar el pedido.
- Los datos de muestra son demostrativos; sustituye precios y fotos antes de entregar.

## 5. Publicación (guías 13–16)
1. Sube el proyecto a GitHub, sin subir archivos `.env`.
2. Crea una base MySQL en la nube (por ejemplo, Aiven). Ejecuta el SQL dentro de la base creada; en un proveedor que ya da una base asignada, no ejecutes `CREATE DATABASE` ni `USE`.
3. Publica `backend` como Web Service en Render. Root Directory: `backend`; Build Command: `npm install`; Start Command: `npm start`. Añade `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `FRONTEND_URL` como variables de entorno con los datos reales del proveedor MySQL. No compartas la contraseña.
4. Cuando Render dé una URL como `https://tu-api.onrender.com`, prueba `https://tu-api.onrender.com/api/health`.
5. En Vercel importa el repositorio y configura Root Directory `frontend`, Build Command `npm run build`, Output Directory `dist`, y variable `VITE_API_URL=https://tu-api.onrender.com/api`. Cambia el valor por tu URL real de Render y vuelve a desplegar.
6. En Render, cambia `FRONTEND_URL` por el dominio real de Vercel y vuelve a desplegar.
7. El enlace de Vercel solo se debe entregar cuando el frontend, API y base de datos estén conectados y probados. No existe un enlace público real hasta que tú publiques el proyecto.

## 6. Pruebas
- `GET /api/health`: estado de API y base de datos.
- Crear un producto desde Administración y comprobar que aparece en la tienda.
- Agregar al carrito y confirmar pedido; revisar que aparezca en Ventas y que disminuya el stock.
- Editar y eliminar productos y empleados.
- Si falla: confirma que MySQL esté iniciado, que `.env` coincida con tu base, que backend esté corriendo, y que `VITE_API_URL` no apunte a localhost cuando está publicado.

## Seguridad
No publiques `.env`, contraseñas ni credenciales. El proyecto es una base educativa y no incluye pagos reales ni autenticación de administrador.
