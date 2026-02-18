const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const port = 3000;

let products = [
  {
    id: nanoid(6),
    name: "Луна",
    category: "спутники",
    description: "Не смотрите на то что запылилась, на луне есть титан, железо и алюминий",
    price: 10000,
    oldPrice: null,
    stock: 1,
    rating: 4.0,
    image: "/images/moon.jpg"
  },
  {
    id: nanoid(6),
    name: "Марс",
    category: "планеты",
    description: "Содержит железо, алюминий, титан, серу и кремний, а также метан. Почти пригоден для жизни",
    price: 5000,
    oldPrice: null,
    stock: 1,
    rating: 4.3,
    image: "/images/mars.jpg"
  },
  {
    id: nanoid(6),
    name: "Солнце",
    category: "звезды",
    description: "Способствует выработке витамина D, можно не платить за отопление",
    price: 10000000,
    oldPrice: null,
    stock: 1,
    rating: 5.0,
    image: "/images/sun.jpg"
  },
  {
    id: nanoid(6),
    name: "Энцелад",
    category: "спутники",
    description: "Содержит колоссальные объемы воды, к сожалению - соленой",
    price: 100,
    oldPrice: 10000,
    stock: 1,
    rating: 4.8,
    image: "/images/enceladus.jpg"
  },
  {
    id: nanoid(6),
    name: "Уран",
    category: "планета",
    description: "Содержит водород, гелий и метан. Ходят слухи что поверхность планеты покрыта алмазами",
    price: 100000,
    oldPrice: null,
    stock: 12,
    rating: 4.6,
    image: "/images/uranus.png"
  }
];

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock, rating = 0, image = '', oldPrice = null } = req.body;

  if (!name || !category || !description || !price || stock === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : null,
    stock: Number(stock),
    rating: Number(rating),
    image: image.trim()
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { name, category, description, price, stock, rating, image, oldPrice } = req.body;

  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (oldPrice !== undefined) product.oldPrice = oldPrice ? Number(oldPrice) : null;
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (image !== undefined) product.image = image.trim();

  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  if (!exists) return res.status(404).json({ error: "Product not found" });

  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});