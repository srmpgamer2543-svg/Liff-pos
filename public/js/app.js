import { loadMenu } from "./menu.js"

async function start(){

await liff.init({
liffId:"2009308319-2r1OXrGI"
})

if(!liff.isLoggedIn()){
liff.login()
return
}

loadMenu()

}

start()
