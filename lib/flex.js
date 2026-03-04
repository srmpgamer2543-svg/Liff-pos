export function createMenuFlex(items) {
  return {
    type: "flex",
    altText: "เมนูสินค้า",
    contents: {
      type: "carousel",
      contents: items.slice(0, 10).map((item) => ({
        type: "bubble",
        size: "mega",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: item.item_name,
              weight: "bold",
              size: "md",
              wrap: true,
              color: "#ff6f00"
            },
            {
              type: "text",
              text: `฿ ${item.variants[0].price}`,
              size: "sm",
              color: "#555555"
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              height: "sm",
              color: "#ff8c00",
              action: {
                type: "postback",
                label: "เลือก",
                data: `add_${item.id}`
              }
            }
          ]
        }
      }))
    }
  };
}
