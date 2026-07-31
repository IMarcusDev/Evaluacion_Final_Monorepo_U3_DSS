-- =====================================================================
-- Seed 01 — Escenario "TecnoStore" (tienda de electrónica / cómputo)
-- ---------------------------------------------------------------------
-- Se ejecuta DESPUÉS de init.sql (MySQL procesa /docker-entrypoint-initdb.d
-- en orden alfabético: init.sql -> seed_01_* -> seed_02_*).
-- Usa IDs explícitos para que las relaciones (FKs) sean deterministas y
-- para NO colisionar con seed_02 (que usa otros rangos de IDs y otras
-- claves únicas: email, sku, nombre de categoría).
--
-- Credenciales de acceso (bcrypt, cost 10):
--   admin.tecno@inventrack.com   / Admin123      (rol admin)
--   bodega.tecno@inventrack.com  / Almacen123    (rol almacenero)
-- =====================================================================

USE `inventrack`;
SET NAMES utf8mb4;

-- --- Usuarios (ids 1-2) ---------------------------------------------
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `activo`) VALUES
  (1, 'Marta Salcedo', 'admin.tecno@inventrack.com',  '$2b$10$qXd6.Om7q7bz2osmyRl.p.GnV.TgONmLls31L5YLjwzIvY7yW80Fa', 'admin',      1),
  (2, 'Luis Farfán',   'bodega.tecno@inventrack.com', '$2b$10$DP0eziSe/5WZrBTC8IyKE.qpigyQ4TMMrT0XRg0fVI2FGYrh4oCLe', 'almacenero', 1);

-- --- Categorías (ids 1-3) -------------------------------------------
INSERT INTO `categorias` (`id`, `nombre`, `descripcion`) VALUES
  (1, 'Electrónica',  'Dispositivos y componentes electrónicos'),
  (2, 'Periféricos',  'Accesorios y periféricos de cómputo'),
  (3, 'Redes',        'Equipos de conectividad y networking');

-- --- Proveedores (ids 1-2) ------------------------------------------
INSERT INTO `proveedores` (`id`, `nombre`, `contacto`, `telefono`, `email`, `direccion`) VALUES
  (1, 'TechSupply SAC',   'Carlos Ramos',  '987654321', 'ventas@techsupply.com',    'Av. Javier Prado 1234, Lima'),
  (2, 'RedesGlobal EIRL', 'Rosa Mendoza',  '987001122', 'contacto@redesglobal.com', 'Jr. Cusco 456, Lima');

-- --- Productos (ids 1-6) --------------------------------------------
-- Nota: TEC-006 queda con stock por debajo del mínimo (alerta de stock bajo).
INSERT INTO `productos`
  (`id`, `sku`, `nombre`, `descripcion`, `categoria_id`, `proveedor_id`, `precio_compra`, `precio_venta`, `stock_actual`, `stock_minimo`, `ubicacion`) VALUES
  (1, 'TEC-001', 'Mouse Inalámbrico Logitech M185', 'Mouse óptico inalámbrico 2.4GHz',        2, 1,  25.00,  45.00,  60, 10, 'Estante A-1'),
  (2, 'TEC-002', 'Teclado Mecánico Redragon K552',  'Teclado mecánico switch red RGB',       2, 1,  80.00, 150.00,  28,  8, 'Estante A-2'),
  (3, 'TEC-003', 'Monitor LED 24" Samsung',         'Monitor Full HD 1920x1080 75Hz',        1, 1, 450.00, 650.00,  18,  5, 'Estante A-3'),
  (4, 'TEC-004', 'Router WiFi TP-Link Archer C6',   'Router dual band AC1200',               3, 2, 120.00, 199.00,  22,  6, 'Estante B-1'),
  (5, 'TEC-005', 'Switch 8 Puertos TP-Link',        'Switch Gigabit no administrable',       3, 2,  95.00, 160.00,  14,  5, 'Estante B-2'),
  (6, 'TEC-006', 'SSD 480GB Kingston A400',         'Unidad de estado sólido SATA III',      1, 1, 140.00, 210.00,   3, 12, 'Estante C-1');

-- --- Movimientos (kardex, ids 1-4) ----------------------------------
INSERT INTO `movimientos`
  (`producto_id`, `usuario_id`, `tipo`, `cantidad`, `stock_anterior`, `stock_nuevo`, `motivo`) VALUES
  (1, 2, 'entrada', 40, 20, 60, 'Reposición de inventario inicial'),
  (2, 2, 'entrada', 30,  0, 30, 'Compra a TechSupply SAC'),
  (2, 1, 'salida',   2, 30, 28, 'Venta mostrador'),
  (6, 2, 'salida',   9, 12,  3, 'Salida por venta corporativa');

-- --- Historial de precios (id 1) ------------------------------------
INSERT INTO `historial_precios`
  (`producto_id`, `usuario_id`, `precio_compra_anterior`, `precio_compra_nuevo`, `precio_venta_anterior`, `precio_venta_nuevo`) VALUES
  (3, 1, 430.00, 450.00, 620.00, 650.00);

-- --- Auditoría (traza de la carga) ----------------------------------
INSERT INTO `auditoria` (`usuario_id`, `accion`, `tabla_afectada`, `registro_id`, `detalle`) VALUES
  (1, 'seed', 'productos', NULL, 'Carga inicial escenario TecnoStore (seed_01)');
