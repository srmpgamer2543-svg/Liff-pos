document.addEventListener("DOMContentLoaded",()=>{

const logo = document.getElementById("logoArea")
const topbar = document.querySelector(".topbar")
const categories = document.getElementById("categories")

if(!logo) return

let targetScroll = 0
let currentScroll = 0

/* iOS spring physics */

const stiffness = 0.09

function animate(){

 targetScroll = window.scrollY

 const delta = targetScroll - currentScroll
 currentScroll += delta * stiffness

 const y = currentScroll

 const maxScroll = 320
 const progress = Math.min(y / maxScroll, 1)

 /* ------------------- */
 /* LOGO AREA HEIGHT */
 /* ------------------- */

 const startHeight = 180
 const endHeight = 60

 const height =
 startHeight - ((startHeight - endHeight) * progress)

 logo.style.height = height + "px"

 /* ------------------- */
 /* LOGO IMAGE SCALE */
 /* ------------------- */

 const logoImg = logo.querySelector("img")

 if(logoImg){

  const scale = 1 - (progress * 0.4)

  logoImg.style.transform = `scale(${scale})`
  logoImg.style.transition = "transform .25s"

 }

 /* ------------------- */
 /* LOGO OPACITY */
 /* ------------------- */

 const logoOpacity = 1 - progress * 0.5
 logo.style.opacity = logoOpacity

 requestAnimationFrame(animate)

}

animate()

})
