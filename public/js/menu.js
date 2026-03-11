function openModifier(item){

 const overlay=document.getElementById("modifierOverlay")
 const modal=document.getElementById("modifierModal")

 let html=`

 <div class="mod-header">

  <img class="mod-image" src="${item.image || ""}">

  <div class="mod-product">

   <div class="mod-product-name">
   ${cleanName(item.name)}
   </div>

   <div class="mod-product-sub">
   ${item.name || ""}
   </div>

  </div>

 </div>

 `

 item.modifier_groups.forEach(group=>{

  const min = group.min_select || 0
  const max = group.max_select || group.modifiers.length

  html+=`<div class="mod-group">`

  html+=`
  <div class="mod-title">
  ${group.name}
  <div class="mod-rule">
  เลือกสูงสุด ${max} ข้อ
  </div>
  </div>
  `

  group.modifiers.forEach(mod=>{

   html+=`

   <label class="mod-option">

    <span>
    ${mod.name}
    </span>

    <span class="mod-price">
    ฿${mod.price || 0}
    </span>

    <input
     type="checkbox"
     name="${group.id}"
     value="${mod.id}"
     data-name="${mod.name}"
     data-price="${mod.price}"
    >

   </label>

   `

  })

  html+=`</div>`

 })

 html+=`

 <div class="mod-footer">

  <div class="qty-box">

   <button id="qtyMinus">-</button>
   <span id="qtyNum">1</span>
   <button id="qtyPlus">+</button>

  </div>

  <button class="confirm-btn">
  ใส่ตะกร้า ฿${item.price}
  </button>

 </div>

 `

 modal.innerHTML=html

 overlay.classList.add("active")

 overlay.onclick=(e)=>{

  if(e.target===overlay){
   overlay.classList.remove("active")
  }

 }

 setTimeout(()=>{

  let qty=1

  const qtyNum=document.getElementById("qtyNum")

  document.getElementById("qtyMinus").onclick=()=>{

   if(qty>1){
    qty--
    qtyNum.innerText=qty
   }

  }

  document.getElementById("qtyPlus").onclick=()=>{

   qty++
   qtyNum.innerText=qty

  }

  const btn=document.querySelector(".confirm-btn")

  btn.onclick=()=>{

   const selections={}
   let extraPrice=0

   item.modifier_groups.forEach(group=>{

    const checked=[...document.querySelectorAll(`input[name="${group.id}"]:checked`)]

    selections[group.name]=checked.map(i=>{

     const n=i.dataset.name
     const price=Number(i.dataset.price||0)

     extraPrice+=price

     return n

    })

   })

   for(let i=0;i<qty;i++){

    addToCart({

     ...item,
     price:item.price + extraPrice,
     modifiers:selections

    })

   }

   overlay.classList.remove("active")

  }

 },50)

}
