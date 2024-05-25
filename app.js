require('dotenv').config();
require('express-async-errors');
// extra  security packages
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

const app = express();

// ConnectDB
const connectDB = require('./db/connect');
const auth = require('./middleware/authentication');
const swagger = require('swagger-ui-express');
const YAML = require('yamljs');
// Routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1);

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  })
);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

const swaggerDocument = YAML.load('./swagger.yaml');

app.get('/', (req, res) => {
  res.send('<h1>Hello To jobs API</h1><a href="/api-docs">Documentation</a>');
});

app.use('/api-docs', swagger.serve, swagger.setup(swaggerDocument));

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', auth, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
