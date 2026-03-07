# Migracion Backend a Prisma + MySQL (Railway)

## Understanding Summary
- Se migra el backend de Express + Mongoose (MongoDB) a Express + Prisma + MySQL en Railway.
- El modelo de datos relacional incluye: roles, users, customers, categories, products, invoices, invoice_items, inventory_movements.
- Se implementa autenticacion JWT con access token (15 min) y refresh token (7 dias).
- Se aplican roles `admin`, `empleado`, `lector` con carga inicial por seed y sin registro publico.
- Se aplican validaciones de negocio en backend para usuarios, clientes, productos, facturas, items y movimientos.
- Facturacion e inventario se ejecutan en transacciones para consistencia.
- Alcance orientado a demo: escala baja y operacion basica.

## Assumptions
- Todas las PK usan `Int @id @default(autoincrement())`.
- Campos de auditoria usan `created_at @default(now())` y `updated_at @updatedAt` donde aplique.
- `invoice_number`, `users.email`, `customers.identification`, `products.sku` son unicos.
- Estados de factura: `DRAFT`, `PAID`, `CANCELLED`.
- Tipos de movimiento: `IN`, `OUT`, `ADJUSTMENT`.
- Passwords con hash bcrypt.
- Se parte de base limpia en MySQL para demo (sin migracion de datos historicos desde MongoDB).
- URL de conexion: `DATABASE_URL=mysql://root:UosyreHnqmVPBWEurGPBEWXGsadGpcyq@trolley.proxy.rlwy.net:48219/railway`.

## Non-Functional Requirements
- Performance: suficiente para uso demo interno.
- Escala esperada: baja (hasta 20 usuarios internos y <50k facturas/anio).
- Seguridad: JWT, hash de password, validaciones de entrada y control de roles.
- Confiabilidad: nivel basico (reinicio manual ante caidas, logs de consola, backup diario DB).
- Mantenibilidad: arquitectura modular por dominio con capas claras.

## Decision Log
1. Se elige migracion completa inmediata a MySQL + Prisma; no coexistencia con MongoDB.
2. Se define seed inicial de roles y usuario admin; no registro publico.
3. Se adopta JWT con access + refresh token.
4. Se define enfoque operativo basico por tratarse de demo.
5. Se elige arquitectura monolito modular en Express.
6. Se concentra logica de negocio en services y persistencia en Prisma.
7. Se usan transacciones para crear factura + items + movimientos + ajuste de stock.
8. Se bloquea salida de inventario cuando no hay stock suficiente.
9. Se calculan totales exclusivamente en backend.

## Design Approaches Evaluated
1. Monolito modular (elegida): menor riesgo y mayor velocidad para demo.
2. DDD-lite: mejor separacion pero sobrecosto inicial.
3. Use-case first: util en logica compleja, menos estandar para CRUD REST.

## Final Architecture
- `src/config`: variables de entorno y configuracion.
- `src/prisma`: `schema.prisma`, cliente prisma y seeds.
- `src/modules/auth`: login, refresh, emision/rotacion de tokens.
- `src/modules/users`: CRUD de usuarios y asignacion de rol.
- `src/modules/customers`: CRUD de clientes y validacion de identificacion.
- `src/modules/categories`: CRUD de categorias.
- `src/modules/products`: CRUD de productos y control de reglas de precio/stock.
- `src/modules/invoices`: creacion/listado/consulta de facturas y detalles.
- `src/modules/inventory`: movimientos de inventario y control de stock.
- `src/middlewares`: auth JWT, roles, validacion y manejo de errores.
- `src/shared`: utilidades comunes.

## Data Model (Prisma-Oriented)
- `roles(id, name, description, created_at, updated_at)`
- `users(id, name, email, password_hash, is_active, role_id, created_at, updated_at)`
- `customers(id, full_name, business_name, identification, email, phone, address, created_at, updated_at)`
- `categories(id, name, description, created_at, updated_at)`
- `products(id, category_id, sku, name, description, price, stock, is_active, created_at, updated_at)`
- `invoices(id, invoice_number, customer_id, user_id, issue_date, subtotal, tax, total, status, created_at, updated_at)`
- `invoice_items(id, invoice_id, product_id, quantity, unit_price, subtotal, tax, total)`
- `inventory_movements(id, product_id, user_id, type, quantity, reference, reason, invoice_id, created_at)`

## Relations
- users N:1 roles
- customers 1:N invoices
- products N:1 categories
- invoices N:1 customers
- invoices N:1 users
- invoice_items N:1 invoices
- invoice_items N:1 products
- inventory_movements N:1 products
- inventory_movements N:1 users
- inventory_movements N:1 invoices (nullable)

## Backend Validations
- users: email unico; password minimo 8 caracteres.
- customers: full_name o business_name obligatorio; identification unica.
- products: name obligatorio; price > 0; stock >= 0.
- invoices: al menos 1 item; customer valido; totales recalculados en backend.
- invoice_items: quantity > 0; unit_price >= 0.
- inventory_movements: quantity > 0; bloquear `OUT` sin stock; `ADJUSTMENT` con motivo.

## Critical Flow: POST /invoices
1. Validar payload y entidades relacionadas.
2. Recalcular subtotales/impuestos/totales por item y cabecera.
3. Validar disponibilidad de stock.
4. Crear invoice + invoice_items.
5. Descontar stock en products.
6. Crear inventory_movements tipo `OUT` por item.
7. Confirmar transaccion.

## Security and Access
- Middleware `requireAuth` para validar access token.
- Middleware `requireRole` para autorizacion por rol.
- Matriz base:
  - `admin`: acceso completo.
  - `empleado`: operaciones de negocio (customers/products/invoices/inventory).
  - `lector`: solo lectura.

## Testing Baseline
- Unit tests para calculos de factura.
- Integration tests para:
  - crear factura valida,
  - rechazar factura sin items,
  - rechazar salida por stock insuficiente,
  - login/refresh y autorizacion por rol.

## Out of Scope (Demo)
- Alta disponibilidad.
- Observabilidad avanzada.
- Migracion automatica de datos historicos de MongoDB.
