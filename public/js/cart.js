export let cart=[]

export function addToCart(item){

cart.push(item)

updateCart()

}

export function updateCart(){

let total=0

cart.forEach(i=>{
total+=i.price
})

document.getElementById("floatingTotal").innerText=total

}
