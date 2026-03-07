export default async function handler(req, res) {

  const r = await fetch("https://api.loyverse.com/v1.0/items", {
    headers: {
      Authorization: "Bearer " + process.env.LOYVERSE_TOKEN
    }
  });

  const data = await r.json();

  const menu = data.items.map(item => {

    const variant = item.variants && item.variants.length > 0 
      ? item.variants[0] 
      : {};

    return {
      id: item.id,
      name: item.item_name,
      description: item.description,
      category_id: item.category_id,
      image: item.image_url,

      // variant data
      variant_id: variant.variant_id,
      sku: variant.sku,
      price: variant.price,
      cost: variant.cost,

      // raw data เผื่อใช้
      variants: item.variants,
      modifier_lists: item.modifier_lists
    };

  });

  res.json(menu);

}
