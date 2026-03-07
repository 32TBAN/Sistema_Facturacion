# Frontend Folder Structure Design

## Date
- 2026-03-07

## Understanding Summary
- Se busca mejorar la estructura de carpetas del frontend de un sistema de facturacion.
- Objetivo principal: orden general para encontrar codigo rapido, escalar sin desorden, separar responsabilidades y facilitar colaboracion.
- Se prefiere arquitectura por dominio/funcionalidad (modulos) sobre organizacion puramente tecnica.
- El alcance incluye reorganizacion de carpetas, convencion de nombres y ajuste de rutas.
- Escala esperada: equipo pequeno (1-3 devs) con crecimiento moderado.
- Requisitos no funcionales: seguridad media (roles y validaciones estrictas), rendimiento estandar (carga inicial menor a 3s).
- Restriccion operativa: migrar sin romper la app ni las rutas actuales.

## Assumptions
- El stack base se mantiene en Vue 3 + Vue Router.
- No se modifica backend ni contratos de API en esta fase.
- La migracion se hace de forma incremental por modulo.
- Se prioriza claridad y mantenibilidad sobre optimizaciones prematuras.

## Decision Log
1. Decision: usar arquitectura modular por dominio.
- Alternativas: organizacion por tipo tecnico puro, enfoque hibrido conservador.
- Motivo: facilita ubicacion de codigo, escalabilidad y separacion de responsabilidades para el objetivo definido.

2. Decision: usar capa compartida minima (`shared`) para elementos realmente transversales.
- Alternativas: todo dentro de cada modulo o gran carpeta global de componentes.
- Motivo: evitar duplicacion sin crear un "cajon de sastre".

3. Decision: migracion incremental sin ruptura.
- Alternativas: big-bang migration completa.
- Motivo: menor riesgo funcional y validacion continua.

## Final Proposed Structure
```text
src/
  app/
    router/
      index.js
      routes.js
    providers/
      axios.js
    styles/
      main.css

  modules/
    auth/
      pages/
        LoginPage.vue
      components/
      services/
        authService.js
      composables/
      types/

    facturas/
      pages/
        FacturasPage.vue
      components/
        FacturaList.vue
        FacturaView.vue
      services/
        facturasService.js
      composables/
      types/

    productos/
      pages/
        ProductosPage.vue
      components/
        ProductList.vue
        ProductsSearch.vue
      services/
        productosService.js
      composables/
      types/

    clientes/
      pages/
        ClientesPage.vue
      components/
        ClientsList.vue
      services/
        clientesService.js
      composables/
      types/

  shared/
    components/
      AppHeader.vue
      BaseModal.vue
    ui/
    utils/
    constants/
    types/

  assets/
  main.js
  App.vue
```

## Naming Conventions
- `pages`: componentes asociados a rutas.
- `components`: piezas visuales del modulo.
- `services`: llamadas HTTP y transformacion de datos.
- `composables`: logica reusable de estado/comportamiento.
- `shared`: solo codigo transversal entre modulos.

## Incremental Migration Plan
1. Crear carpetas base (`app`, `modules`, `shared`) sin mover todo de una vez.
2. Separar definicion de rutas en `app/router/routes.js`.
3. Migrar modulo por modulo:
- `auth`: `loginFactura.vue` -> `modules/auth/pages/LoginPage.vue`.
- `productos`: `ProductList.vue`, `ProductsSearch.vue`.
- `clientes`: `ClienetsList.vue` -> `ClientsList.vue`.
- `facturas`: `ListaFacturas.vue`, `ViewFactura.vue`.
4. Extraer llamadas HTTP desde componentes hacia `services` por modulo.
5. Mover reutilizables reales a `shared/components`:
- `Firt-Header.vue` -> `AppHeader.vue`.
- `PopUp.vue` -> `BaseModal.vue`.
6. Ajustar imports con alias (`@/modules`, `@/shared`, `@/app`).
7. Validar al terminar cada modulo para evitar regresiones.
8. Eliminar archivos legacy cuando ya no tengan referencias.

## Risks And Mitigations
- Riesgo: imports rotos durante movimiento de archivos.
  - Mitigacion: migrar por modulo y validar inmediatamente.
- Riesgo: mezcla de codigo compartido y codigo de modulo.
  - Mitigacion: regla explicita de uso de `shared` solo para elementos transversales.
- Riesgo: rutas rotas.
  - Mitigacion: mantener paths actuales y cambiar internamente el componente destino.

## Non-Goals
- No rediseñar backend ni modelo de datos del servidor.
- No introducir sobreingenieria (microfrontends, arquitectura enterprise).
- No optimizacion de rendimiento avanzada en esta fase.
