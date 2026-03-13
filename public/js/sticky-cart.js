document.addEventListener("DOMContentLoaded",()=>{

 const confirmBtn = document.getElementById("confirm-order-btn")

 if(confirmBtn){

  confirmBtn.onclick = (e)=>{

   e.preventDefault()

   openOrderScreen()

  }

 }

})
