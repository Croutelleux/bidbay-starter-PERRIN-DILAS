<script setup>
import { ref, computed } from "vue";

const errorText = ref("");
const loading = ref(true);

const typeToSort = ref(1);
const nameToFilter = ref("");
const productsList = ref([]);

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}

const bidUpperPrice = (product) => {
  const bids = product.bids;

  bids.sort((b1, b2) => b2.price - b1.price);

  return bids?.[0]?.price ?? product.originalPrice;
};

async function getProducts() {
  const query = await fetch("http://localhost:3000/api/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const res = await query.json();

  if (query.ok) {
    productsList.value = res;
  } else {
    errorText.value =
      `${res?.error}: ${res?.details}` ?? "Une erreur est survenue";
  }

  loading.value = false;
}

function setSortValue(valeur) {
  typeToSort.value = valeur;
}

getProducts();

const filteredProducts = computed(() => {
  let filteredProducts = productsList.value;

  if (nameToFilter.value.length > 0) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(nameToFilter.value.toLowerCase())
    );
  }

  if (typeToSort.value == null) {
    return filteredProducts;
  }

  if (typeToSort.value == 1) {
    filteredProducts.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  } else if (typeToSort.value == 2) {
    filteredProducts.sort(function (a, b) {
      if (a.bids.length > 0 && b.bids.length > 0)
        return (
          a.bids[a.bids.length - 1].price - b.bids[b.bids.length - 1].price
        );
      if (a.bids.length > 0 && b.bids.length == 0)
        return a.bids[a.bids.length - 1].price - b.originalPrice;
      if (a.bids.length == 0 && b.bids.length > 0)
        return a.originalPrice - b.bids[b.bids.length - 1].price;
      if (a.bids.length == 0 && b.bids.length == 0)
        return a.originalPrice - b.originalPrice;
    });
  }

  return filteredProducts;
});
</script>

<template>
  <div>
    <h1 class="text-center mb-4">Liste des produits</h1>

    <div class="row mb-3">
      <div class="col-md-6">
        <form>
          <div class="input-group">
            <span class="input-group-text">Filtrage</span>
            <input
              v-model="nameToFilter"
              type="text"
              class="form-control"
              placeholder="Filtrer par nom"
              data-test-filter
            />
          </div>
        </form>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button
            type="button"
            class="btn btn-primary dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-test-sorter
          >
            Trier par {{ typeToSort == 1 ? "nom" : "prix" }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" href="#" v-on:click="setSortValue(1)">
                Nom
              </a>
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                v-on:click="setSortValue(2)"
                data-test-sorter-price
              >
                Prix
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div
      v-if="errorText"
      class="alert alert-danger mt-4"
      role="alert"
      data-test-error
    >
      {{ errorText }}
    </div>
    <div v-if="!loading && !errorText" class="row">
      <div
        class="col-md-4 mb-4"
        v-for="product of filteredProducts"
        data-test-product
      >
        <div class="card">
          <RouterLink
            :to="{ name: 'Product', params: { productId: product.id } }"
          >
            <img
              :src="product.pictureUrl"
              data-test-product-picture
              class="card-img-top"
            />
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title">
              <RouterLink
                data-test-product-name
                :to="{ name: 'Product', params: { productId: product.id } }"
              >
                {{ product.name }}
              </RouterLink>
            </h5>
            <p class="card-text" data-test-product-description>
              {{ product.description }}
            </p>
            <p class="card-text">
              Vendeur :
              <RouterLink
                data-test-product-seller
                :to="{ name: 'User', params: { userId: product.seller.id } }"
              >
                {{ product.seller.username }}
              </RouterLink>
            </p>
            <p class="card-text" data-test-product-date>
              En cours jusqu'au {{ formatDate(product.endDate) }}
            </p>
            <div v-if="product.bids.length > 0">
              <p class="card-text" data-test-product-price>
                Prix actuel :
                {{ bidUpperPrice(product) }} €
              </p>
            </div>
            <div v-if="product.bids.length == 0">
              <p class="card-text" data-test-product-price>
                Prix de départ : {{ product.originalPrice }} €
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
