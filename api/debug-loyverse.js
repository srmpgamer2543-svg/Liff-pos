import fetch from "node-fetch"

export default async function handler(req,res){

 try{

  const token = process.env.LOYVERSE_API_KEY

  if(!token){
   return res.status(500).json({
    error:"LOYVERSE_API_KEY not found in environment variables"
   })
  }

  const headers={
   Authorization:`Bearer ${token}`,
   "Content-Type":"application/json"
  }

  async function testEndpoint(name,url){

   try{

    const r = await fetch(url,{headers})

    const text = await r.text()

    let json=null

    try{
     json = JSON.parse(text)
    }catch(e){
     json = null
    }

    return{
     endpoint:name,
     url:url,
     status:r.status,
     ok:r.ok,
     headers:Object.fromEntries(r.headers.entries()),
     raw:text.substring(0,1000),
     json:json
    }

   }catch(err){

    return{
     endpoint:name,
     url:url,
     error:err.message
    }

   }

  }

  const itemsTest = await testEndpoint(
   "items",
   "https://api.loyverse.com/v1.0/items?limit=5"
  )

  const categoriesTest = await testEndpoint(
   "categories",
   "https://api.loyverse.com/v1.0/categories"
  )

  const modifiersTest = await testEndpoint(
   "modifier_groups",
   "https://api.loyverse.com/v1.0/modifier_groups"
  )

  res.status(200).json({

   debug:true,

   token_present: !!token,

   tests:{
    items:itemsTest,
    categories:categoriesTest,
    modifier_groups:modifiersTest
   }

  })

 }catch(err){

  res.status(500).json({
   error:err.message
  })

 }

}
