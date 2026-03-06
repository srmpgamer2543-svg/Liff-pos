async function loadMenu(){

 const res = await fetch("/api/menu")

 const data = await res.json()

 const menuDiv = document.getElementById("menu")

 data.forEach(item => {

   const el = document.createElement("div")

   el.innerHTML = `
   <h3>${item.name}</h3>
   <p>${item.price} บาท</p>
   <button onclick="addCart('${item.id}','${item.name}',${item.price})">
   เพิ่ม
   </button>
   `

   menuDiv.appendChild(el)

 })

}

function addCart(id,name,price){

 let cart = JSON.parse(localStorage.getItem("cart")) || []

 cart.push({
   id,
   name,
   price,
   qty:1
 })

 localStorage.setItem("cart",JSON.stringify(cart))

 alert("เพิ่มแล้ว")

}

loadMenu()
