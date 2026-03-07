# Frontend Modernization Design (Vue 3 + Vite + TypeScript)

## Date
- 2026-03-07

## Understanding Summary
- Se modernizara el frontend a Vue 3 + Vite + TypeScript.
- La migracion sera incremental sobre el repositorio actual (in-place), no big-bang.
- La UI se migrara progresivamente a shadcn-vue como sistema principal.
- El estado global se centralizara en Pinia por dominio.
- Formularios criticos usaran vee-validate + zod (login, productos, clientes, facturas).
- Las tablas se estandarizaran con @tanstack/vue-table (filtros, paginacion, ordenamiento).
- Se implementara auth con guards por rol y base preparada para refresh token.

## Assumptions
- Se mantienen endpoints backend actuales.
- El refresh token real puede no existir aun en backend; se prepara infraestructura frontend.
- Se acepta coexistencia temporal de UI legacy durante migracion por fases.
- Se usara Axios como cliente HTTP central.
- Escala esperada: equipo pequeno, crecimiento moderado.

## Non-Functional Requirements
- Rendimiento: carga inicial razonable con lazy loading por rutas.
- Seguridad: control de acceso por roles y manejo centralizado de sesion/token.
- Confiabilidad: manejo consistente de loading/empty/error y fallos HTTP.
- Mantenibilidad: arquitectura modular, tipado estricto incremental y componentes reutilizables.
- Operacion: entregas por fases con validacion continua para reducir riesgo.

## Interface Design Direction
### Domain
- Punto de venta
- Flujo de caja
- Inventario en tiempo real
- Cierre de factura
- Historial de transacciones
- Control de permisos por rol

### Color world
- Blanco papel de comprobante
- Gris tinta de tablero de control
- Verde operacion confirmada
- Rojo alerta/cancelacion
- Azul accion primaria de gestion
- Ambar advertencia de stock

### Signature
- Barra de estado operacional fija por pantalla: usuario/rol, sucursal, estado de sesion y acceso rapido a acciones criticas (facturar, clientes, productos, facturas).

### Defaults to reject
- Default 1: dashboard generico con cards sueltas -> reemplazo: layout operativo centrado en flujo de facturacion.
- Default 2: tablas aisladas sin contexto -> reemplazo: tabla con toolbar de filtros + acciones de fila + estado de carga/error.
- Default 3: formularios basicos sin feedback robusto -> reemplazo: formularios tipados con validacion declarativa y mensajes consistentes.

## Selected Approach
- Estrategia seleccionada: migracion incremental in-place sobre el proyecto actual.
- Justificacion: minimiza riesgo operativo, permite entregas continuas y evita duplicacion de codigo entre v1/v2.

## Target Architecture
- Stack: Vue 3 + Vite + TypeScript.
- UI: shadcn-vue como sistema base de componentes.
- Estado: Pinia por dominio (`auth`, `productos`, `clientes`, `facturas`).
- Forms: vee-validate + zod con esquemas por modulo.
- Tabla: @tanstack/vue-table + componentes reutilizables compartidos.
- HTTP: Axios centralizado con interceptores y estrategia refresh-ready.
- Auth: router guards (`requiresAuth`, `roles`) + pagina 403 + fallback de sesion.

## Folder Structure (Target)
```text
src/
  app/
    router/
      index.ts
      routes.ts
      guards.ts
    providers/
      pinia.ts
      axios.ts
    styles/
      tokens.css
      main.css

  modules/
    auth/
      pages/
      components/
      schemas/
      services/
      store/
      types/
    productos/
      pages/
      components/
      schemas/
      services/
      store/
      types/
    clientes/
      pages/
      components/
      schemas/
      services/
      store/
      types/
    facturas/
      pages/
      components/
      schemas/
      services/
      store/
      types/

  shared/
    ui/
    table/
      DataTable.vue
      DataTableToolbar.vue
      DataTablePagination.vue
    http/
      client.ts
      interceptors.ts
    utils/
    types/
```

## Migration Phases
1. Fase 0 - Fundaciones
- Migrar a Vite + TypeScript.
- Configurar alias, linting TS y type-check.
- Instalar Pinia, axios, shadcn-vue, vee-validate, zod, tanstack table.
- Salida: app corre y build pasa en Vite.

2. Fase 1 - App Shell + Auth base
- Router tipado con `requiresAuth` y `roles`.
- `authStore` + persistencia minima.
- Guard global + pagina 403.
- Cliente HTTP central con interceptores.
- Salida: rutas protegidas por rol funcionando.

3. Fase 2 - UI System
- Migrar layout, header y navegacion a shadcn-vue.
- Reemplazo progresivo de Bootstrap.
- Salida: shell principal sobre nuevo sistema UI.

4. Fase 3 - Forms tipados
- Migrar formularios criticos con vee-validate + zod.
- Salida: validacion consistente y tipada.

5. Fase 4 - Tabla robusta
- Implementar DataTable reusable con filtros/paginacion/sort.
- Aplicar a productos, clientes, facturas.
- Salida: experiencia tabular unificada.

6. Fase 5 - Hardening
- Estandarizar errores y estados.
- Dejar refresh token listo para conectar endpoint futuro.
- Pruebas base de guards/forms/tabla.
- Salida: estabilidad de release.

## Risks and Mitigations
- Riesgo: friccion por migracion JS -> TS.
  - Mitigacion: modo incremental con `allowJs` temporal y modulos prioritarios.
- Riesgo: inconsistencia visual durante coexistencia.
  - Mitigacion: policy de migracion por pantalla completa (no mezclar en una misma vista).
- Riesgo: regresiones en auth/routing.
  - Mitigacion: pruebas de navegacion por rol y flujos criticos en cada fase.

## Decision Log
1. Se adopta migracion incremental in-place.
- Alternativas: big-bang, app paralela v2.
- Motivo: menor riesgo y entrega continua.

2. Se adopta shadcn-vue como sistema UI principal.
- Alternativas: convivencia indefinida con Bootstrap.
- Motivo: consistencia y mantenibilidad.

3. Se adopta Pinia por dominio.
- Alternativas: estado local disperso.
- Motivo: trazabilidad de estado y escalabilidad.

4. Se adopta vee-validate + zod para formularios criticos.
- Alternativas: validacion manual por componente.
- Motivo: esquema unico, tipado y menor duplicacion.

5. Se adopta @tanstack/vue-table para tablas.
- Alternativas: tabla custom minima o libreria cerrada.
- Motivo: flexibilidad sin acoplamiento excesivo.

6. Se define auth robusta con roles + refresh-ready.
- Alternativas: auth minima sin base de refresh.
- Motivo: evitar retrabajo cuando backend habilite refresh.

## Exit Criteria Check
- Understanding Lock confirmado por usuario: SI
- Enfoque explicitamente aceptado: SI
- Supuestos documentados: SI
- Riesgos principales reconocidos: SI
- Decision Log completo: SI
