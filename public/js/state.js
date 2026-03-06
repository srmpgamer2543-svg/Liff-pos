export const state = {
  products: [],
  cart: [],
  currentProduct: null
}

export function setProducts(data){
  state.products = data
}

export function setCurrentProduct(product){
  state.currentProduct = product
}

export function addToCart(item){
  state.cart.push(item)
}

export function clearCart(){
  state.cart = []
}
