import { getMenu } from "./api.js"
import { addToCart } from "./cart.js"

let allMenu = []
let categories = []

export async function loadMenu(){

  const menu = await getMenu()

  allMenu = menu || []

  // ดึงหมวดหมู่จาก menu
  const map = {}

  allMenu.forEach(item => {
    if(!map[item.category_id]){
      map[item.category_id] = item.category_name
    }
  })

  categories = Object.keys(map).map(id => ({
    id,
    name: map[id]
  }))

  // เรียงหมวดตามเลขหน้าชื่อ
  categories.sort((a,b)=>{
    const na = parseInt(a.name.split("_")[0])
    const nb = parseInt(b.name.split("_")[0])
    return na-nb
  })

  renderCategories()

  // เรียงสินค้า
  allMenu.sort((a,b)=>{
    const ca = categories.find(c=>c.id===a.category_id)
    const cb = categories.find(c=>c.id===b.category_id)

    const na = parseInt(ca?.name.split("_")[0] || 0)
    const nb = parseInt(cb?.name.split("_")[0] || 0)

    if(na !== nb) return na-nb

    return a.name.localeCompare(b.name)
  })

  renderMenu(allMenu)

}

function renderCategories(){

  const container = document.getElementById("categories")
  if(!container) return

  container.innerHTML=""

  const allBtn = document.createElement("button")
  allBtn.innerText = "ทั้งหมด"
  allBtn.onclick = () => renderMenu(allMenu)

  container.appendChild(allBtn)

  categories.forEach(cat => {

    const btn = document.createElement("button")

    // ลบเลข 01_
    const name = cat.name.replace(/^\d+_/, "")

    btn.innerText = name

    btn.onclick = () => {

      const filtered = allMenu.filter(i => i.category_id === cat.id)

      renderMenu(filtered)

    }

    container.appendChild(btn)

  })

}

function renderMenu(menu){

  const container = document.getElementById("menu")
  if(!container) return

  container.innerHTML=""

  menu.forEach(item => {

    const div = document.createElement("div")

    div.className = "item"

    div.innerHTML = `
      <img src="${item.image || ""}">
      <h3>${item.name}</h3>
      <p>${item.price}</p>
      <button>เพิ่ม</button>
    `

    div.querySelector("button").onclick = () => addToCart(item)

    container.appendChild(div)

  })

}
