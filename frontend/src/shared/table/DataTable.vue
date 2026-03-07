<script setup lang="ts" generic="TData, TValue">
import { computed, ref } from "vue";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
} from "@tanstack/vue-table";
import { Button } from "@/shared/ui/button";

const props = defineProps<{
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  filterColumn?: string;
  filterPlaceholder?: string;
}>();

const globalFilter = ref("");

const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  state: {
    get globalFilter() {
      return globalFilter.value;
    },
  },
  onGlobalFilterChange: (value) => {
    globalFilter.value = String(value);
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: {
    pagination: {
      pageSize: 8,
    },
  },
});

const totalRows = computed(() => table.getFilteredRowModel().rows.length);
</script>

<template>
  <div class="table-wrapper">
    <div class="table-toolbar">
      <input
        v-model="globalFilter"
        class="table-filter"
        :placeholder="filterPlaceholder ?? 'Filtrar resultados'"
        type="search"
      />
      <span class="table-count">{{ totalRows }} resultados</span>
    </div>

    <table class="data-table">
      <thead>
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.getRowModel().rows" :key="row.id">
          <td v-for="cell in row.getVisibleCells()" :key="cell.id">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </td>
        </tr>
        <tr v-if="table.getRowModel().rows.length === 0">
          <td :colspan="columns.length" class="empty-row">No se encontraron datos</td>
        </tr>
      </tbody>
    </table>

    <div class="table-pagination">
      <Button variant="outline" size="sm" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
        Anterior
      </Button>
      <span>Pagina {{ table.getState().pagination.pageIndex + 1 }} de {{ table.getPageCount() || 1 }}</span>
      <Button variant="outline" size="sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
        Siguiente
      </Button>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper {
  display: grid;
  gap: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.table-filter {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 10px;
  min-width: 260px;
}

.table-count {
  font-size: 0.9rem;
  color: #475569;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.data-table th,
.data-table td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.data-table th {
  background-color: #f8fafc;
  font-weight: 600;
}

.empty-row {
  text-align: center;
  color: #64748b;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
</style>
