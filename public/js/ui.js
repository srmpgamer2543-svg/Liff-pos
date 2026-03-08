export function toggleCart(){

const cart = document.getElementById("cart")

const current = window.getComputedStyle(cart).right

if(current === "0px"){

cart.style.right = "-100%"

}else{

cart.style.right = "0"

}

}
