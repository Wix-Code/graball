import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import storeRoutes from './routes/store.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/store', storeRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});