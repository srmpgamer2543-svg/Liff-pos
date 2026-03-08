function renderCategories(){

const catDiv = document.getElementById("categories")

let cats = [...new Set(
menuData
.map(i => i.category_name || i.category)
.filter(Boolean)
)]

cats.sort((a,b)=>{

let na = parseInt(a.split("_")[0]) || 999
let nb = parseInt(b.split("_")[0]) || 999

return na - nb

})

catDiv.innerHTML = `
<div class="cat" onclick="renderMenu(menuData)">
ทั้งหมด
</div>
`

cats.forEach(cat => {

let parts = cat.split("_")
let showName = parts.length > 1 ? parts.slice(1).join("_") : cat

catDiv.innerHTML += `
<div class="cat" onclick="filterCat('${cat}')">
${showName}
</div>
`

})

}
