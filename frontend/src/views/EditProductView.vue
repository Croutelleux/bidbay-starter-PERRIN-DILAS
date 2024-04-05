<script setup>
import { useAuthStore } from "../store/auth";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();
const route = useRoute();

if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}

const errorText = ref("")
const loading = ref(false)

const productId = ref(route.params.productId)
const productName = ref("")
const productDescription = ref("")
const productCategory = ref("")
const productOriginalPrice = ref("")
const productPictureUrl = ref("")
const productEndDate = ref("")

async function getProduct() {
  const query = await fetch(`http://localhost:3000/api/products/${productId.value}`, {
    'method': 'GET',
    'headers': {
      'Content-Type': 'application/json',
    }
  })

  const res = await query.json()

  if (query.ok) {
    productName.value = res.name
    productDescription.value = res.description
    productCategory.value = res.category
    productOriginalPrice.value = res.originalPrice
    productPictureUrl.value = res.pictureUrl
    productEndDate.value = new Date(res.endDate).toLocaleDateString('sv-SE')
  } else {
    errorText.value = `${res?.error}: ${res?.details}` ?? 'Une erreur est survenue'
  }

  loading.value = false
}

getProduct()

async function editProduct() {
  loading.value = true

  const query = await fetch(`http://localhost:3000/api/products/${productId.value}`, {
    'method': 'PUT',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.value}`
    },
    'body': JSON.stringify({
      id: productId.value,
      name: productName.value,
      description: productDescription.value,
      category: productCategory.value,
      originalPrice: productOriginalPrice.value,
      pictureUrl: productPictureUrl.value,
      endDate: productEndDate.value
    })
  })

  const res = await query.json()

  if (query.ok) {
    router.push({ name: "Product", params: { productId: res.id } })
  } else {
    errorText.value = `${res?.error}: ${res?.details}` ?? 'Une erreur est survenue'
  }

  loading.value = false
}
</script>

<template>
  <h1 class="text-center">Modifier un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="editProduct">
        <div v-if="errorText !== ''" class="alert alert-danger mt-4" role="alert" data-test-error>
          {{ errorText }}
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input type="text" class="form-control" id="product-name" required data-test-product-name
            v-model="productName" />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea class="form-control" id="product-description" name="description" rows="3" required
            data-test-product-description v-model="productDescription"></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input type="text" class="form-control" id="product-category" required data-test-product-category
            v-model="productCategory" />
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">
            Prix de départ
          </label>
          <div class="input-group">
            <input type="number" class="form-control" id="product-original-price" name="originalPrice" step="1" min="0"
              required data-test-product-price v-model="productOriginalPrice" />
            <span class="input-group-text">€</span>
          </div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input type="url" class="form-control" id="product-picture-url" name="pictureUrl" required
            data-test-product-picture v-model="productPictureUrl" />
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">
            Date de fin de l'enchère
          </label>
          <input type="date" class="form-control" id="product-end-date" name="endDate" required data-test-product-end-date
            v-model="productEndDate" />
        </div>

        <div class="d-grid gap-2">
          <button :disabled="loading" type="submit" class="btn btn-primary" data-test-submit>
            Modifier le produit
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" data-test-spinner></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
