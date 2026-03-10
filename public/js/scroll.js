const logo = document.getElementById("logoArea")
const topbar = document.querySelector(".topbar")
const categories = document.getElementById("categories")

let ticking = false

window.addEventListener("scroll", () => {

 if (!ticking) {

  requestAnimationFrame(() => {

   const y = window.scrollY

   /* ระยะ scroll เพิ่มเพื่อให้ animation ลื่นขึ้น */
   const progress = Math.min(y / 300, 1)

   /* LOGO */

   const logoTranslate = -60 * progress
   const logoOpacity = 1 - (progress * 0.9)

   logo.style.transform = `translateY(${logoTranslate}%)`
   logo.style.opacity = logoOpacity

   /* ปรับความสูง logo ให้หดแบบ smooth */

   const startHeight = 75
   const endHeight = 25
   const height = startHeight - ((startHeight - endHeight) * progress)

   logo.style.height = `${height}vh`

   /* TOPBAR */

   const topbarTranslate = -15 * progress
   topbar.style.transform = `translateY(${topbarTranslate}px)`

   /* CATEGORIES */

   const catTranslate = -10 * progress
   categories.style.transform = `translateY(${catTranslate}px)`

   ticking = false

  })

  ticking = true

 }

}, { passive: true })
