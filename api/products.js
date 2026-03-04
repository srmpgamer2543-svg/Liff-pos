export default async function handler(req, res) {
  const response = await fetch("https://api.loyverse.com/v1.0/items", {
    headers: {
      Authorization: "Bearer sk_live_xxxxxxxxxxx"
    }
  });

  const data = await response.json();
  res.status(200).json(data);
}
