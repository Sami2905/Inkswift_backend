require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const bruteForce = require('./middleware/bruteForce');

const app = express();
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = [
  'https://localhost:3000',
  // Add your main production Netlify domain here if you have one, e.g.:
  // 'https://inkswift.netlify.app'
];

function isNetlifyPreview(origin) {
  // Allow all Netlify deploy previews
  return /^https:\/\/[a-z0-9-]+--inkswift\.netlify\.app$/.test(origin);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || isNetlifyPreview(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));
app.use(helmet());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Inkswift' });
});

// Import and use modular routes (auth, docs, signatures, audit)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const docsRoutes = require('./routes/docs');
const signaturesRoutes = require('./routes/signatures');
const publicSignRoutes = require('./routes/publicSign');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use('/api/docs', docsRoutes);
app.use('/api/signatures', signaturesRoutes);
app.use('/api/sign', publicSignRoutes);

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Document Signature App API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inkswift';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Inkswift server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

if (bruteForce.clearBruteForceApp) {
  app.use(bruteForce.clearBruteForceApp);
} 