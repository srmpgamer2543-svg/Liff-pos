const logo=document.getElementById("logoArea")

let lastState=false
let ticking=false

window.addEventListener("scroll",()=>{

 if(!ticking){

  requestAnimationFrame(()=>{

   const shouldHide=window.scrollY>120

   if(shouldHide!==lastState){

    logo.classList.toggle("logo-hidden",shouldHide)

    lastState=shouldHide

   }

   ticking=false

  })

  ticking=true

 }

},{passive:true})
