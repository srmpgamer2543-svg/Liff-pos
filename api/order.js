export default async function handler(req,res){

 const order = req.body

 await fetch(process.env.SUPABASE_URL+"/rest/v1/orders",{
  method:"POST",
  headers:{
   apikey:process.env.SUPABASE_KEY,
   "Content-Type":"application/json"
  },
  body:JSON.stringify(order)
 })

 res.json({success:true})

}
