import { loadMenu } from "./menu.js"
import { toggleCart } from "./ui.js"
import { checkout } from "./order.js"

window.toggleCart = toggleCart
window.checkout = checkout

document.addEventListener("DOMContentLoaded",()=>{

loadMenu()

})
