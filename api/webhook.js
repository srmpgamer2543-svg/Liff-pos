export default async function handler(req, res) {

  if (req.method === "POST") {

    console.log("LINE BODY:");
    console.log(JSON.stringify(req.body, null, 2));

  }

  res.status(200).json({ status: "ok" });

}
