export default async function handler(req, res) {

  const r = await fetch("https://api.loyverse.com/v1.0/items", {
    headers: {
      Authorization: "Bearer " + process.env.LOYVERSE_TOKEN
    }
  });

  const data = await r.json();

  const menu = data.items.map(item => {

    const variant = item.variants?.[0] || {};
    const store = variant.stores?.[0] || {};

    const price = store.price ?? variant.default_price ?? 0;

    return {
      id: item.id,
      name: item.item_name,
      price: price,
      image: item.image_url,
      category: item.category_id
    };

  });

  res.json(menu);
}
