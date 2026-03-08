<template>
  <section class="invoice-builder">
    <header class="panel notice">
      <h1>
        <font-awesome-icon :icon="['fas', 'file-invoice']" />
        Nueva factura
      </h1>
      <p>
        <font-awesome-icon :icon="['fas', 'circle-info']" />
        Completa cliente y productos para emitir una factura.
      </p>
      <div class="notice-state">
        <span :class="['chip', selectedCustomerId ? 'ok' : 'pending']">
          <font-awesome-icon :icon="['fas', selectedCustomerId ? 'circle-check' : 'clock']" />
          {{ selectedCustomerId ? "Cliente seleccionado" : "Cliente pendiente" }}
        </span>
        <span :class="['chip', cart.length ? 'ok' : 'pending']">
          <font-awesome-icon :icon="['fas', cart.length ? 'cart-shopping' : 'clock']" />
          {{ cart.length ? `${cart.length} producto(s)` : "Sin productos" }}
        </span>
      </div>
    </header>

    <section class="panel">
      <div class="panel-head">
        <h2>
          <font-awesome-icon :icon="['fas', 'user']" />
          Cliente
        </h2>
        <button class="ghost" @click="openCustomerModal">
          <font-awesome-icon :icon="['fas', 'user-plus']" />
          Crear cliente
        </button>
      </div>

      <div class="field">
        <label for="customer-search">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          Buscar por identificacion o nombre
        </label>
        <input
          id="customer-search"
          v-model="customerSearch"
          type="search"
          placeholder="Ej: 0912345678 o Juan Perez"
        />
      </div>

      <div class="search-list">
        <button
          v-for="customer in filteredCustomers.slice(0, 8)"
          :key="customer.id"
          class="result-item"
          :class="{ active: selectedCustomerId === customer.id }"
          @click="selectCustomer(customer)"
        >
          <strong>
            <font-awesome-icon :icon="['fas', 'id-card']" />
            {{ customerDisplayName(customer) }}
          </strong>
          <small>
            <font-awesome-icon :icon="['fas', 'hashtag']" />
            {{ customer.identification }}
          </small>
        </button>
      </div>

      <p v-if="showNoCustomerHint" class="hint">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
        No se encontraron clientes con ese criterio.
      </p>
    </section>

    <section class="panel">
      <h2>
        <font-awesome-icon :icon="['fas', 'box']" />
        Productos
      </h2>
      <div class="field">
        <label for="product-search">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          Buscar por nombre o SKU
        </label>
        <input
          id="product-search"
          v-model="productSearch"
          type="search"
          placeholder="Ej: ARROZ o SKU-001"
        />
      </div>

      <div class="products-grid">
        <article v-for="product in filteredProducts.slice(0, 12)" :key="product.id" class="product-card">
          <div>
            <strong>{{ product.name }}</strong>
            <p :title="product.sku">
              <font-awesome-icon :icon="['fas', 'barcode']" />
              <span class="sku-text">SKU: {{ product.sku }}</span>
            </p>
            <p>
              <font-awesome-icon :icon="['fas', 'dollar-sign']" />
              Precio: {{ formatMoney(product.price) }}
            </p>
            <p>
              <font-awesome-icon :icon="['fas', 'boxes-stacked']" />
              Stock: {{ product.stock }}
            </p>
          </div>
          <button :disabled="product.stock <= 0 || !product.isActive" @click="addProduct(product)">
            <font-awesome-icon :icon="['fas', 'cart-plus']" />
            Agregar
          </button>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>
        <font-awesome-icon :icon="['fas', 'list-check']" />
        Detalle de factura
      </h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th><font-awesome-icon :icon="['fas', 'box']" /> Producto</th>
              <th><font-awesome-icon :icon="['fas', 'hashtag']" /> Cantidad</th>
              <th><font-awesome-icon :icon="['fas', 'dollar-sign']" /> P. Unitario</th>
              <th><font-awesome-icon :icon="['fas', 'calculator']" /> Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in cart"
              :key="item.productId"
              :class="{ 'row-added': recentlyAddedProductId === item.productId }"
            >
              <td>{{ item.name }}</td>
              <td>
                <input
                  class="quantity-input"
                  :value="item.quantity"
                  type="number"
                  min="1"
                  :max="item.maxStock"
                  @input="updateQuantity(item.productId, $event)"
                />
              </td>
              <td>{{ formatMoney(item.unitPrice) }}</td>
              <td>{{ formatMoney(item.unitPrice * item.quantity) }}</td>
              <td>
                <button class="ghost danger" @click="removeItem(item.productId)">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                  Quitar
                </button>
              </td>
            </tr>
            <tr v-if="cart.length === 0">
              <td colspan="5" class="empty">No hay productos agregados</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-breakdown">
        <div class="summary-row">
          <span>
            <font-awesome-icon :icon="['fas', 'receipt']" />
            Subtotal
          </span>
          <strong>{{ formatMoney(subtotalAmount) }}</strong>
        </div>
        <div class="summary-row">
          <span>
            <font-awesome-icon :icon="['fas', 'percent']" />
            Tax 15%
          </span>
          <strong>{{ formatMoney(taxAmount) }}</strong>
        </div>
        <div class="summary-row total">
          <span>
            <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            Total
          </span>
          <strong>{{ formatMoney(totalAmount) }}</strong>
        </div>
      </div>

      <div class="summary-actions">
        <button :disabled="!canCreateInvoice" @click="createInvoice">
          <font-awesome-icon :icon="['fas', 'paper-plane']" />
          {{ creating ? "Emitiendo..." : "Emitir factura" }}
        </button>
      </div>

      <p v-if="successMessage" class="ok">
        <font-awesome-icon :icon="['fas', 'circle-check']" />
        {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="error">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
        {{ errorMessage }}
      </p>
    </section>

    <div v-if="showInvoiceSummary" class="modal-backdrop" @click.self="closeInvoiceSummary">
      <section class="modal-card summary-card">
        <header>
          <h3>
            <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            Resumen de factura
          </h3>
          <button class="ghost icon-only" @click="closeInvoiceSummary" aria-label="Cerrar">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </header>

        <div v-if="invoiceSummary" class="summary-content">
          <p><strong>Factura:</strong> {{ invoiceSummary.invoiceNumber }}</p>
          <p><strong>Cliente:</strong> {{ invoiceSummary.customerName }}</p>
          <p><strong>Identificacion:</strong> {{ invoiceSummary.customerIdentification }}</p>

          <table class="summary-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>P. Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invoiceSummary.items" :key="item.productId">
                <td>{{ item.name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatMoney(item.unitPrice) }}</td>
                <td>{{ formatMoney(item.unitPrice * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-breakdown compact">
            <div class="summary-row">
              <span>Subtotal</span>
              <strong>{{ formatMoney(invoiceSummary.subtotal) }}</strong>
            </div>
            <div class="summary-row">
              <span>Tax 15%</span>
              <strong>{{ formatMoney(invoiceSummary.tax) }}</strong>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <strong>{{ formatMoney(invoiceSummary.total) }}</strong>
            </div>
          </div>
        </div>

        <footer>
          <button class="ghost" @click="printInvoiceSummary">
            <font-awesome-icon :icon="['fas', 'print']" />
            Imprimir 80mm
          </button>
          <button class="primary" @click="closeInvoiceSummary">
            <font-awesome-icon :icon="['fas', 'check']" />
            Cerrar
          </button>
        </footer>
      </section>
    </div>

    <transition name="toast-fade">
      <div v-if="addToastVisible" class="add-toast" role="status" aria-live="polite">
        <font-awesome-icon :icon="['fas', 'cart-plus']" />
        {{ addToastMessage }}
      </div>
    </transition>

    <div v-if="showCustomerModal" class="modal-backdrop" @click.self="closeCustomerModal">
      <section class="modal-card">
        <header>
          <h3>
            <font-awesome-icon :icon="['fas', 'address-card']" />
            Crear cliente
          </h3>
          <button class="ghost icon-only" @click="closeCustomerModal" aria-label="Cerrar">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </header>

        <div class="modal-grid">
          <div class="field">
            <label for="new-identification">
              <font-awesome-icon :icon="['fas', 'id-card']" />
              Identificacion
            </label>
            <input id="new-identification" v-model="newCustomer.identification" type="text" maxlength="10" />
            <small :class="['validation', identificationStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(identificationStatus)]" />
              {{ identificationMessage }}
            </small>
          </div>

          <div class="field">
            <label for="new-name">
              <font-awesome-icon :icon="['fas', 'user']" />
              Nombre completo
            </label>
            <input id="new-name" v-model="newCustomer.fullName" type="text" />
            <small :class="['validation', fullNameStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(fullNameStatus)]" />
              {{ fullNameMessage }}
            </small>
          </div>

          <div class="field">
            <label for="new-email">
              <font-awesome-icon :icon="['fas', 'envelope']" />
              Email (opcional)
            </label>
            <input id="new-email" v-model="newCustomer.email" type="email" />
            <small :class="['validation', emailStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(emailStatus)]" />
              {{ emailMessage }}
            </small>
          </div>

          <div class="field">
            <label for="new-phone">
              <font-awesome-icon :icon="['fas', 'phone']" />
              Telefono (opcional)
            </label>
            <input id="new-phone" v-model="newCustomer.phone" type="text" />
            <small :class="['validation', phoneStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(phoneStatus)]" />
              {{ phoneMessage }}
            </small>
          </div>
        </div>

        <p v-if="customerErrorMessage" class="error">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
          {{ customerErrorMessage }}
        </p>

        <footer>
          <button class="ghost" @click="closeCustomerModal">
            <font-awesome-icon :icon="['fas', 'xmark']" />
            Cancelar
          </button>
          <button :disabled="creatingCustomer || !isCustomerFormValid" @click="createCustomer">
            <font-awesome-icon :icon="['fas', 'floppy-disk']" />
            {{ creatingCustomer ? "Guardando..." : "Guardar cliente" }}
          </button>
        </footer>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { isAxiosError } from "axios";
import { httpClient } from "@/shared/http/client";

const ECUADOR_TAX_RATE = 0.15;

type Product = {
  id: number;
  sku: string;
  name: string;
  price: number | string;
  stock: number;
  isActive: boolean;
};

type Customer = {
  id: number;
  fullName: string | null;
  businessName: string | null;
  identification: string;
  email?: string | null;
  phone?: string | null;
};

type CartItem = {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

type CreatedInvoice = {
  invoiceNumber: string;
};

type InvoiceSummary = {
  invoiceNumber: string;
  customerName: string;
  customerIdentification: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
};

type ValidationStatus = "pending" | "valid" | "invalid";

const products = ref<Product[]>([]);
const customers = ref<Customer[]>([]);
const cart = ref<CartItem[]>([]);
const selectedCustomerId = ref(0);
const customerSearch = ref("");
const productSearch = ref("");
const creating = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const showCustomerModal = ref(false);
const customerErrorMessage = ref("");
const creatingCustomer = ref(false);
const showInvoiceSummary = ref(false);
const invoiceSummary = ref<InvoiceSummary | null>(null);
const recentlyAddedProductId = ref<number | null>(null);
const addToastVisible = ref(false);
const addToastMessage = ref("");
let highlightTimer: ReturnType<typeof setTimeout> | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const newCustomer = ref({
  identification: "",
  fullName: "",
  email: "",
  phone: "",
});

const customerDisplayName = (customer: Customer) =>
  customer.fullName || customer.businessName || "Sin nombre";

const selectedCustomer = computed(
  () => customers.value.find((customer) => customer.id === selectedCustomerId.value) ?? null
);

const filteredCustomers = computed(() => {
  const term = customerSearch.value.trim().toLowerCase();
  if (!term) return customers.value;
  return customers.value.filter((customer) => {
    const name = customerDisplayName(customer).toLowerCase();
    return customer.identification.toLowerCase().includes(term) || name.includes(term);
  });
});

const showNoCustomerHint = computed(
  () =>
    customerSearch.value.trim().length > 0 &&
    filteredCustomers.value.length === 0 &&
    selectedCustomerId.value === 0
);

const filteredProducts = computed(() => {
  const term = productSearch.value.trim().toLowerCase();
  if (!term) return products.value;
  return products.value.filter(
    (product) => product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)
  );
});

const subtotalAmount = computed(() =>
  cart.value.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
);
const taxAmount = computed(() => subtotalAmount.value * ECUADOR_TAX_RATE);
const totalAmount = computed(() => subtotalAmount.value + taxAmount.value);

const canCreateInvoice = computed(() => selectedCustomerId.value > 0 && cart.value.length > 0 && !creating.value);

const formatMoney = (value: number | string) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const isValidEcuadorCedula = (value: string) => {
  const cedula = digitsOnly(value);
  if (!/^\d{10}$/.test(cedula)) return false;

  const province = Number(cedula.slice(0, 2));
  if (province < 1 || province > 24) return false;

  const thirdDigit = Number(cedula[2]);
  if (thirdDigit >= 6) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let digit = Number(cedula[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number(cedula[9]);
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const trimmedIdentification = computed(() => digitsOnly(newCustomer.value.identification));
const trimmedFullName = computed(() => newCustomer.value.fullName.trim());
const trimmedEmail = computed(() => newCustomer.value.email.trim());
const trimmedPhone = computed(() => digitsOnly(newCustomer.value.phone));

const identificationStatus = computed<ValidationStatus>(() => {
  if (!trimmedIdentification.value) return "pending";
  return isValidEcuadorCedula(trimmedIdentification.value) ? "valid" : "invalid";
});

const fullNameStatus = computed<ValidationStatus>(() => {
  if (!trimmedFullName.value) return "pending";
  return trimmedFullName.value.length >= 3 ? "valid" : "invalid";
});

const emailStatus = computed<ValidationStatus>(() => {
  if (!trimmedEmail.value) return "pending";
  return emailRegex.test(trimmedEmail.value) ? "valid" : "invalid";
});

const phoneStatus = computed<ValidationStatus>(() => {
  if (!trimmedPhone.value) return "pending";
  return trimmedPhone.value.length >= 10 ? "valid" : "invalid";
});

const identificationMessage = computed(() => {
  if (identificationStatus.value === "pending") return "Ingrese cedula ecuatoriana de 10 digitos.";
  if (identificationStatus.value === "invalid") return "Cedula invalida para Ecuador.";
  return "Cedula valida.";
});

const fullNameMessage = computed(() => {
  if (fullNameStatus.value === "pending") return "Ingrese nombre completo.";
  if (fullNameStatus.value === "invalid") return "El nombre debe tener al menos 3 caracteres.";
  return "Nombre valido.";
});

const emailMessage = computed(() => {
  if (emailStatus.value === "pending") return "Puede dejarlo vacio o ingresar un email valido.";
  if (emailStatus.value === "invalid") return "Formato de email invalido.";
  return "Email valido.";
});

const phoneMessage = computed(() => {
  if (phoneStatus.value === "pending") return "Puede dejarlo vacio o ingresar telefono.";
  if (phoneStatus.value === "invalid") return "El telefono debe tener al menos 10 digitos.";
  return "Telefono valido.";
});

const isCustomerFormValid = computed(
  () =>
    identificationStatus.value === "valid" &&
    fullNameStatus.value === "valid" &&
    (emailStatus.value === "valid" || emailStatus.value === "pending") &&
    (phoneStatus.value === "valid" || phoneStatus.value === "pending")
);

const statusIcon = (status: ValidationStatus) => {
  if (status === "valid") return "circle-check";
  if (status === "invalid") return "circle-xmark";
  return "clock";
};

const fetchBaseData = async () => {
  const [productsResponse, customersResponse] = await Promise.all([
    httpClient.get<Product[]>("/products"),
    httpClient.get<Customer[]>("/customers"),
  ]);
  products.value = productsResponse.data;
  customers.value = customersResponse.data;
};

const selectCustomer = (customer: Customer) => {
  selectedCustomerId.value = customer.id;
  customerSearch.value = `${customerDisplayName(customer)} ${customer.identification}`;
};

const openCustomerModal = () => {
  customerErrorMessage.value = "";
  showCustomerModal.value = true;
};

const closeCustomerModal = () => {
  showCustomerModal.value = false;
  newCustomer.value = {
    identification: "",
    fullName: "",
    email: "",
    phone: "",
  };
};

const closeInvoiceSummary = () => {
  showInvoiceSummary.value = false;
};

const createCustomer = async () => {
  if (!isCustomerFormValid.value) {
    customerErrorMessage.value = "Corrige los campos resaltados antes de guardar.";
    return;
  }

  creatingCustomer.value = true;
  customerErrorMessage.value = "";

  try {
    const payload = {
      identification: trimmedIdentification.value,
      fullName: trimmedFullName.value,
      email: trimmedEmail.value || undefined,
      phone: trimmedPhone.value || undefined,
    };

    const { data } = await httpClient.post<Customer>("/customers", payload);
    customers.value = [data, ...customers.value];
    selectedCustomerId.value = data.id;
    customerSearch.value = `${customerDisplayName(data)} ${data.identification}`;
    closeCustomerModal();
  } catch (error) {
    if (isAxiosError(error)) {
      customerErrorMessage.value =
        (error.response?.data as { message?: string } | undefined)?.message || "No se pudo crear el cliente.";
    } else {
      customerErrorMessage.value = "No se pudo crear el cliente.";
    }
  } finally {
    creatingCustomer.value = false;
  }
};

const addProduct = (product: Product) => {
  const existing = cart.value.find((item) => item.productId === product.id);
  if (existing) {
    if (existing.quantity < existing.maxStock) {
      existing.quantity += 1;
    }
  } else {
    cart.value.push({
      productId: product.id,
      name: product.name,
      unitPrice: Number(product.price),
      quantity: 1,
      maxStock: product.stock,
    });
  }

  recentlyAddedProductId.value = product.id;
  addToastMessage.value = `${product.name} agregado al detalle`;
  addToastVisible.value = true;

  if (highlightTimer) clearTimeout(highlightTimer);
  if (toastTimer) clearTimeout(toastTimer);

  highlightTimer = setTimeout(() => {
    recentlyAddedProductId.value = null;
  }, 1100);

  toastTimer = setTimeout(() => {
    addToastVisible.value = false;
  }, 1600);
};

const updateQuantity = (productId: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const item = cart.value.find((entry) => entry.productId === productId);
  if (!item) return;
  const requested = Number(target.value);
  if (!Number.isFinite(requested) || requested < 1) {
    item.quantity = 1;
    return;
  }
  item.quantity = Math.min(requested, item.maxStock);
};

const removeItem = (productId: number) => {
  cart.value = cart.value.filter((item) => item.productId !== productId);
};

const createInvoice = async () => {
  if (!canCreateInvoice.value) return;
  creating.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const currentItems = cart.value.map((item) => ({ ...item }));
    const currentCustomer = selectedCustomer.value;
    const payload = {
      customerId: selectedCustomerId.value,
      items: currentItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    const { data } = await httpClient.post<CreatedInvoice>("/invoices", payload);

    invoiceSummary.value = {
      invoiceNumber: data.invoiceNumber,
      customerName: currentCustomer ? customerDisplayName(currentCustomer) : "Sin cliente",
      customerIdentification: currentCustomer?.identification ?? "-",
      items: currentItems,
      subtotal: subtotalAmount.value,
      tax: taxAmount.value,
      total: totalAmount.value,
    };
    showInvoiceSummary.value = true;

    successMessage.value = `Factura ${data.invoiceNumber} creada correctamente.`;
    selectedCustomerId.value = 0;
    customerSearch.value = "";
    cart.value = [];
    await fetchBaseData();
  } catch (error) {
    if (isAxiosError(error)) {
      errorMessage.value =
        (error.response?.data as { message?: string } | undefined)?.message || "No se pudo crear la factura.";
    } else {
      errorMessage.value = "No se pudo crear la factura.";
    }
  } finally {
    creating.value = false;
  }
};

const printInvoiceSummary = () => {
  if (!invoiceSummary.value) return;
  const summary = invoiceSummary.value;
  const lines = summary.items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${formatMoney(item.unitPrice)}</td><td>${formatMoney(item.unitPrice * item.quantity)}</td></tr>`
    )
    .join("");

  const printWindow = window.open("", "_blank", "width=420,height=700");
  if (!printWindow) {
    errorMessage.value = "El navegador bloqueo la ventana de impresion.";
    return;
  }

  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };

  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Factura ${summary.invoiceNumber}</title>
        <style>
          @page { size: 80mm auto; margin: 4mm; }
          body { font-family: "Courier New", monospace; font-size: 12px; margin: 0; color: #111; }
          .ticket { width: 72mm; margin: 0 auto; }
          h1 { font-size: 13px; margin: 0 0 4px; text-align: center; }
          p { margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; }
          th, td { text-align: left; padding: 2px 0; vertical-align: top; }
          th:nth-child(2), th:nth-child(3), th:nth-child(4),
          td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: right; }
          .sep { border-top: 1px dashed #333; margin: 6px 0; }
          .totals p { display: flex; justify-content: space-between; }
          .totals strong { display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <h1>FACTURA</h1>
          <p>No: ${summary.invoiceNumber}</p>
          <p>Cliente: ${summary.customerName}</p>
          <p>ID: ${summary.customerIdentification}</p>
          <div class="sep"></div>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant</th>
                <th>P.U.</th>
                <th>Subt.</th>
              </tr>
            </thead>
            <tbody>${lines}</tbody>
          </table>
          <div class="sep"></div>
          <div class="totals">
            <p><span>Subtotal</span><span>${formatMoney(summary.subtotal)}</span></p>
            <p><span>Tax 15%</span><span>${formatMoney(summary.tax)}</span></p>
            <strong><span>Total</span><span>${formatMoney(summary.total)}</span></strong>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
};

onMounted(async () => {
  try {
    await fetchBaseData();
  } catch {
    errorMessage.value = "No se pudo cargar clientes y productos.";
  }
});
</script>

<style scoped>
.invoice-builder {
  display: grid;
  gap: 16px;
}

.panel {
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
  text-align: left;
}

.notice {
  background: linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%);
}

.notice-state {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  font-size: 0.82rem;
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chip.ok {
  color: #166534;
  border-color: #86efac;
  background: #dcfce7;
}

.chip.pending {
  color: #92400e;
  border-color: #fcd34d;
  background: #fef3c7;
}

.panel h1,
.panel h2,
.panel h3,
.panel p {
  margin: 0;
}

.panel h1,
.panel h2,
.panel h3,
.field label,
.summary-row span,
th {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.field {
  display: grid;
  gap: 6px;
}

input,
button {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.search-list {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.result-item {
  text-align: left;
  display: grid;
  gap: 2px;
  background: #fff;
}

.result-item strong,
.result-item small {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.result-item.active {
  border-color: #93c5fd;
  background: #eff6ff;
}

.result-item small {
  color: #64748b;
}

.hint {
  margin-top: 8px;
  color: #64748b;
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.products-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  display: grid;
  gap: 8px;
}

.product-card p {
  margin: 4px 0 0;
  color: #475569;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.sku-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: 170px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border-bottom: 1px solid #e2e8f0;
  padding: 8px;
  white-space: nowrap;
}

.row-added {
  animation: rowAddedPulse 1.1s ease;
  background: #ecfdf5;
}

.quantity-input {
  width: 92px;
}

.empty {
  color: #64748b;
  text-align: center;
}

.summary-breakdown {
  margin-top: 12px;
  display: grid;
  gap: 6px;
}

.summary-breakdown.compact {
  margin-top: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.summary-row.total {
  border-top: 1px dashed #cbd5e1;
  padding-top: 8px;
}

.summary-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.ghost {
  background: transparent;
}

.ghost.danger {
  color: #b91c1c;
}

.ok {
  margin: 10px 0 0;
  color: #166534;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.error {
  margin: 10px 0 0;
  color: #b91c1c;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-card {
  width: min(760px, 100%);
  background: white;
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 12px;
}

.modal-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-card {
  max-height: 90vh;
  overflow: auto;
}

.summary-content p {
  margin: 0;
}

.summary-table {
  margin-top: 10px;
  width: 100%;
  border-collapse: collapse;
}

.summary-table th,
.summary-table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 8px;
  white-space: normal;
}

.icon-only {
  padding: 8px 10px;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.validation {
  font-size: 0.8rem;
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.validation.pending {
  color: #64748b;
}

.validation.valid {
  color: #166534;
}

.validation.invalid {
  color: #b91c1c;
}

.modal-card footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.primary {
  background: #1e3a5f;
  color: #fff;
  border-color: #1e3a5f;
}

.add-toast {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 45;
  background: #052e16;
  color: #f0fdf4;
  border: 1px solid #15803d;
  border-radius: 10px;
  padding: 10px 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 12px 28px rgba(2, 6, 23, 0.25);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes rowAddedPulse {
  0% { background: #86efac; }
  100% { background: #ecfdf5; }
}

@media (max-width: 920px) {
  .summary-actions {
    justify-content: stretch;
  }

  .summary-actions button {
    width: 100%;
  }

  .modal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
