import { useEffect, useState } from "react"
import liff from "@line/liff"

export default function Home() {

  const [name,setName] = useState("Loading...")
  const [userId,setUserId] = useState("")

  useEffect(() => {

    async function init(){

      await liff.init({
        liffId:"2009308319-2r1OXrGI"
      })

      if(!liff.isLoggedIn()){
        liff.login()
        return
      }

      const profile = await liff.getProfile()

      setName(profile.displayName)
      setUserId(profile.userId)

    }

    init()

  },[])

  return (

    <div style={{padding:20,fontFamily:"sans-serif"}}>

      <h1>LIFF POS TEST</h1>

      <p>Name: {name}</p>
      <p>UserID: {userId}</p>

    </div>

  )

}
