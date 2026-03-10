const logo = document.getElementById("logoArea")
const topbar = document.querySelector(".topbar")
const categories = document.getElementById("categories")

let ticking = false

window.addEventListener("scroll", () => {

 if (!ticking) {

  requestAnimationFrame(() => {

   const y = window.scrollY

   /* ระยะ scroll สำหรับ animation */
   const maxScroll = 320
   const progress = Math.min(y / maxScroll, 1)

   /* ----------------------- */
   /* LOGO COLLAPSE */
   /* ----------------------- */

   const startHeight = 75
   const endHeight = 18

   const height =
    startHeight - ((startHeight - endHeight) * progress)

   logo.style.height = `${height}vh`

   const logoTranslate = -390 * progress
   const logoOpacity = 1 - progress

   logo.style.transform = `translateY(${logoTranslate}%)`
   logo.style.opacity = logoOpacity

   /* ----------------------- */
   /* TOPBAR MOVE UP */
   /* ----------------------- */

   const topbarMove = -390 * progress

   topbar.style.transform = `translateY(${topbarMove}px)`

   /* ----------------------- */
   /* CATEGORY MOVE UP */
   /* ----------------------- */

   const catMove = -390 * progress

   categories.style.transform = `translateY(${catMove}px)`

   ticking = false

  })

  ticking = true

 }

}, { passive: true })
