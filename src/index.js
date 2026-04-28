import express from 'express';
import cors from 'cors';
import { matchesRouter } from './router/Matchs.js';


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.use("/matches",matchesRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});