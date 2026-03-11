export default async function handler(req,res){

 const headers={
  Authorization:`Bearer ${process.env.LOYVERSE_API_KEY}`
 }

 const r=await fetch("https://api.loyverse.com/v1.0/modifiers",{headers})
 const data=await r.json()

 res.json(data)

}
