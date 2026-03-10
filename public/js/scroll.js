const logo = document.getElementById("logoArea")
const topbar = document.querySelector(".topbar")
const categories = document.getElementById("categories")
const header = document.querySelector(".header-wrapper")

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
 /* HEADER HEIGHT */
 /* ------------------- */

 const headerHeight = header.offsetHeight
 const move = -headerHeight * progress

 /* ------------------- */
 /* LOGO */
 /* ------------------- */

 const startHeight = 75
 const endHeight = 18

 const height =
 startHeight - ((startHeight - endHeight) * progress)

 logo.style.height = `${height}vh`

 const logoOpacity = 1 - progress

 logo.style.transform = `translate3d(0,${move}px,0)`
 logo.style.opacity = logoOpacity

 /* ------------------- */
 /* TOPBAR */
 /* ------------------- */

 topbar.style.transform = `translate3d(0,${move}px,0)`

 /* ------------------- */
 /* CATEGORIES */
 /* ------------------- */

 categories.style.transform = `translate3d(0,${move}px,0)`

 requestAnimationFrame(animate)

}

animate()
