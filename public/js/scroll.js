let ticking=false

window.addEventListener("scroll",()=>{

 if(!ticking){

  requestAnimationFrame(()=>{

   const logo=document.getElementById("logoArea")

   if(window.scrollY>120){

    logo.classList.add("logo-hidden")

   }else{

    logo.classList.remove("logo-hidden")

   }

   ticking=false

  })

  ticking=true

 }

},{passive:true})
