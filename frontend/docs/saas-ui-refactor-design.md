# SaaS UI Refactor Design (Billing System)

## Date
- 2026-03-07

## Understanding Summary
- Se refactorizara la interfaz para un estilo SaaS profesional de facturacion.
- El primer foco visual es login profesional con contexto de producto.
- La app autenticada usara shell con sidebar izquierda colapsable y topbar operativa.
- Se diferenciaran experiencias por rol: `admin` y `cashier`.
- Landing por rol: `admin` -> dashboard KPI; `cashier` -> nueva factura.
- Menus no autorizados se ocultaran y se mantendra bloqueo por guard + 403.
- Objetivo de rendimiento: dashboard admin con carga progresiva/skeleton y respuesta fluida.

## Assumptions
- Se mantiene stack actual (Vue 3 + Vite + TS + Pinia + Router + Axios).
- No se cambian contratos backend en esta iteracion.
- Se prioriza layout y experiencia de uso sobre expansion funcional profunda.

## Domain / Direction
- Domain: caja activa, turnos, cierre de factura, historial, alertas de inventario, permisos por rol.
- Color world: gris pizarra, azul acero, verde estado, ambar alerta, rojo control, blanco humo.
- Signature: barra de turno persistente con rol/estado/caja + accion contextual.
- Defaults rechazados: login generico, sidebar sin jerarquia, dashboard de cards sueltas.

## Selected Layout Strategy
- `AuthLayout`: login sin ruido de navegacion.
- `AppShellLayout`: sidebar izquierda colapsable, drawer movil y topbar compacta.
- Navegacion por tareas con CTA principal por rol.
- Sistema de bordes suaves (sin sombras fuertes) para apariencia sobria y profesional.

## Decision Log
1. Se define shell SaaS con sidebar izquierda colapsable.
- Alternativas: topnav unica, sidebar fija no responsive.
- Motivo: claridad de navegacion y escalabilidad modular.

2. Se separa experiencia por rol en el primer destino post-login.
- Alternativas: dashboard unico para todos.
- Motivo: reducir friccion de tareas segun perfil operativo.

3. Se prioriza login profesional antes de redisenar todo el modulo de facturacion.
- Alternativas: cambiar todas las vistas a la vez.
- Motivo: impacto inmediato en calidad percibida y entrada de usuarios.

4. Se ocultan menus sin permiso y se conserva bloqueo de ruta.
- Alternativas: deshabilitar menus visibles.
- Motivo: UX mas limpia y menor confusion.
