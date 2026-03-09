export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "API working",
    loyverse: process.env.LOYVERSE_API_KEY ? true : false,
    supabase: process.env.SUPABASE_URL ? true : false
  });
}
