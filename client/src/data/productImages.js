const productPhotos = [
  { match: /ceramic|pottery|bowl|vase|clay/i, url: '/images/ceramics.jpg' },
  { match: /textile|linen|fabric|weav|towel|cloth/i, url: '/images/textiles.jpg' },
  { match: /jewel|earring|necklace|bracelet|ring/i, url: '/images/jewelry.jpg' },
  { match: /wood|carv|spoon|cutting board/i, url: '/images/woodwork.jpg' },
  { match: /candle|soap|bath/i, url: '/images/candles.jpg' },
  { match: /print|paper|art/i, url: '/images/art.jpg' }
];

export function productPhoto(product = {}) {
  if (product.imageUrl) return product.imageUrl;
  const description = `${product.title || ''} ${product.category || ''}`;
  const match = productPhotos.find((entry) => entry.match.test(description));
  return match?.url || '/images/home-bg.jpg';
}
