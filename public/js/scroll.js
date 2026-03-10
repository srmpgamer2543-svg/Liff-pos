const logo = document.getElementById("logoArea")
const topbar = document.querySelector(".topbar")
const categories = document.getElementById("categories")

let targetScroll = 0
let currentScroll = 0

const spring = 0.08
const friction = 0.82

function animate() {

 targetScroll = window.scrollY

 const delta = targetScroll - currentScroll
 currentScroll += delta * spring

 const y = currentScroll

 /* ระยะ scroll */
 const maxScroll = 320
 const progress = Math.min(y / maxScroll, 1)

 /* ----------------------- */
 /* LOGO (ไม่เปลี่ยน logic) */
 /* ----------------------- */

 const startHeight = 75
 const endHeight = 18

 const height =
  startHeight - ((startHeight - endHeight) * progress)

 logo.style.height = `${height}vh`

 const logoTranslate = -390 * progress
 const logoOpacity = 1 - progress

 logo.style.transform = `translate3d(0,${logoTranslate}%,0)`
 logo.style.opacity = logoOpacity

 /* ----------------------- */
 /* TOPBAR */
 /* ----------------------- */

 const topbarMove = -390 * progress

 topbar.style.transform = `translate3d(0,${topbarMove}px,0)`

 /* ----------------------- */
 /* CATEGORY */
 /* ----------------------- */

 const catMove = -390 * progress

 categories.style.transform = `translate3d(0,${catMove}px,0)`

 requestAnimationFrame(animate)

}

animate()
