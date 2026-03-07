export default async function handler(req, res) {

  try {

    const response = await fetch("https://api.loyverse.com/v1.0/items", {
      headers: {
        Authorization: "Bearer " + process.env.LOYVERSE_TOKEN
      }
    });

    const data = await response.json();

    const menu = data.items.map(item => {

      let price = 0;

      if (item.variants && item.variants.length > 0) {

        const variant = item.variants[0];

        if (variant.stores && variant.stores.length > 0) {
          price = Number(variant.stores[0].price);
        }
        else if (variant.default_price) {
          price = Number(variant.default_price);
        }

      }

      return {
        id: item.id,
        name: item.item_name,
        description: item.description,
        category: item.category_id,
        image: item.image_url,
        price: price
      };

    });

    res.status(200).json(menu);

  } catch (error) {

    res.status(500).json({
      error: "menu api error",
      detail: error.message
    });

  }

}
