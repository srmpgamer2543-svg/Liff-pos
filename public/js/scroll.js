const logo = document.getElementById("logoArea")
const topbar = document.querySelector(".topbar")
const categories = document.getElementById("categories")

let ticking = false

window.addEventListener("scroll", () => {

 if (!ticking) {

  requestAnimationFrame(() => {

   const y = window.scrollY

   const progress = Math.min(y / 120, 1)

   const logoTranslate = -120 * progress
   const logoOpacity = 1 - progress
   const logoHeight = 1 - progress

   logo.style.transform = `translateY(${logoTranslate}%)`
   logo.style.opacity = logoOpacity
   logo.style.height = `${75 - (75 * progress)}vh`

   const topbarTranslate = -40 * progress
   topbar.style.transform = `translateY(${topbarTranslate}px)`

   const catTranslate = -40 * progress
   categories.style.transform = `translateY(${catTranslate}px)`

   ticking = false

  })

  ticking = true

 }

}, { passive: true })
