export default async function handler(req,res){

 if(req.method!=="POST"){
  return res.status(405).end()
 }

 try{

  const body = req.body

  const response = await fetch(
   process.env.SUPABASE_URL + "/rest/v1/order_items",
   {
    method:"POST",
    headers:{
     apikey:process.env.SUPABASE_KEY,
     Authorization:`Bearer ${process.env.SUPABASE_KEY}`,
     "Content-Type":"application/json"
    },
    body:JSON.stringify(body)
   }
  )

  const data = await response.json()

  res.json(data)

 }catch(err){

  res.status(500).json({error:err.message})

 }

}
