export default function handler(req,res){

res.status(200).json({
 success:true,
 env:process.env.LOYVERSE_API_KEY?true:false
})

}
