async function initLIFF(){

 await liff.init({
   liffId: "YOUR_LIFF_ID"
 })

 if(!liff.isLoggedIn()){
   liff.login()
 }

 const profile = await liff.getProfile()

 localStorage.setItem("userId",profile.userId)
 localStorage.setItem("name",profile.displayName)

 window.location.href="/menu.html"

}

initLIFF()
