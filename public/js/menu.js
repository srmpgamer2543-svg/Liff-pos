import { getMenu } from "./api.js"
import { addToCart } from "./cart.js"

let allMenu = []

export async function loadMenu(){

  const menu = await getMenu()

  allMenu = menu || []

  // เรียงตาม category_id ก่อน
  allMenu.sort((a,b)=>{
    if(a.category_id !== b.category_id){
      return a.category_id.localeCompare(b.category_id)
    }
    return a.name.localeCompare(b.name)
  })

  renderCategories()
  renderMenu(allMenu)

}

function renderCategories(){

  const container = document.getElementById("categories")
  if(!container) return

  container.innerHTML=""

  const allBtn = document.createElement("button")
  allBtn.innerText = "ทั้งหมด"

  allBtn.onclick = ()=>{
    renderMenu(allMenu)
  }

  container.appendChild(allBtn)

  const categoryMap = {}

  allMenu.forEach(item=>{
    if(!categoryMap[item.category_id]){
      categoryMap[item.category_id] = true
    }
  })

  Object.keys(categoryMap).forEach(catId=>{

    const btn = document.createElement("button")

    btn.innerText = catId

    btn.onclick = ()=>{
      const filtered = allMenu.filter(i=>i.category_id===catId)
      renderMenu(filtered)
    }

    container.appendChild(btn)

  })

}

function renderMenu(menu){

  const container = document.getElementById("menu")
  if(!container) return

  container.innerHTML=""

  menu.forEach(item=>{

    const div = document.createElement("div")

    div.className="item"

    div.innerHTML=`
      <img src="${item.image || ""}">
      <h3>${item.name}</h3>
      <p>${item.price}</p>
      <button>เพิ่ม</button>
    `

    div.querySelector("button").onclick=()=>{
      addToCart(item)
    }

    container.appendChild(div)

  })

}
