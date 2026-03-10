const logo = document.getElementById("logoArea")
const topbar = document.querySelector(".topbar")
const categories = document.getElementById("categories")

let targetScroll = 0
let currentScroll = 0

/* iOS spring physics */

const stiffness = 0.09
const damping = 0.8

function animate(){

 targetScroll = window.scrollY

 const delta = targetScroll - currentScroll
 currentScroll += delta * stiffness

 const y = currentScroll

 const maxScroll = 320
 const progress = Math.min(y / maxScroll, 1)

 /* ------------------- */
 /* LOGO */
 /* ------------------- */

 const startHeight = 75
 const endHeight = 18

 const height =
 startHeight - ((startHeight - endHeight) * progress)

 logo.style.height = `${height}vh`

 const logoTranslate = -390 * progress
 const logoOpacity = 1 - progress

 logo.style.transform = `translate3d(0,${logoTranslate}%,0)`
 logo.style.opacity = logoOpacity

 /* ------------------- */
 /* TOPBAR */
 /* ------------------- */

 const topbarMove = -390 * progress
 topbar.style.transform = `translate3d(0,${topbarMove}px,0)`

 /* ------------------- */
 /* CATEGORIES */
 /* ------------------- */

 const catMove = -390 * progress
 categories.style.transform = `translate3d(0,${catMove}px,0)`

 requestAnimationFrame(animate)

}

animate()
