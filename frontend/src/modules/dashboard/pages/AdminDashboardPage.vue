<template>
  <section class="admin-dashboard">
    <header class="heading">
      <h1>Dashboard de operaciones</h1>
      <p>Resumen del turno y control de facturacion en tiempo real.</p>
    </header>

    <div class="kpi-grid">
      <article class="kpi-card" v-for="card in kpis" :key="card.title">
        <h2>{{ card.title }}</h2>
        <strong>{{ card.value }}</strong>
        <span :class="['delta', card.status]">{{ card.delta }}</span>
      </article>
    </div>

    <section class="panel-grid">
      <article class="panel">
        <h3>Alertas</h3>
        <ul>
          <li>3 productos con stock critico</li>
          <li>1 factura anulada en la ultima hora</li>
          <li>2 cobros pendientes de confirmacion</li>
        </ul>
      </article>
      <article class="panel">
        <h3>Actividad reciente</h3>
        <ul>
          <li>#1450 Factura emitida - Cliente 0091</li>
          <li>#1449 Factura emitida - Cliente 0114</li>
          <li>#1448 Ajuste de cantidad en carrito</li>
        </ul>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
const kpis = [
  { title: "Ventas hoy", value: "$4,280", delta: "+12.5%", status: "up" },
  { title: "Facturas emitidas", value: "83", delta: "+9", status: "up" },
  { title: "Ticket promedio", value: "$51.56", delta: "+3.2%", status: "up" },
  { title: "Stock critico", value: "7", delta: "Atender", status: "warn" },
];
</script>

<style scoped>
.admin-dashboard {
  display: grid;
  gap: 16px;
}

.heading h1 {
  margin: 0;
  font-size: 1.5rem;
}

.heading p {
  margin: 6px 0 0;
  color: #64748b;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card,
.panel {
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #f8fafc;
  padding: 14px;
  text-align: left;
}

.kpi-card h2 {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}

.kpi-card strong {
  display: block;
  margin-top: 8px;
  font-size: 1.6rem;
}

.delta {
  display: inline-block;
  margin-top: 8px;
  font-size: 0.85rem;
  padding: 2px 8px;
  border-radius: 99px;
}

.delta.up {
  background: #dcfce7;
  color: #166534;
}

.delta.warn {
  background: #fef3c7;
  color: #92400e;
}

.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.panel h3 {
  margin: 0 0 10px;
}

.panel ul {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  display: grid;
  gap: 8px;
}

@media (max-width: 980px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
