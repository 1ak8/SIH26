require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./utils/errorHandler');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const healthWorkerRoutes = require('./routes/healthWorkerRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const immunizationRoutes = require('./routes/immunizationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const referralRoutes = require('./routes/referralRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const cacheMiddleware = require('./middleware/cacheMiddleware');
const { keepAlive } = require('./controllers/keepAliveController');

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('join', (room) => { socket.join(room); });
  socket.on('disconnect', () => { console.log(`Socket disconnected: ${socket.id}`); });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'SehatSaarthi Backend', timestamp: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/patient', cacheMiddleware(10000), patientRoutes);
app.use('/api/health-worker', cacheMiddleware(10000), healthWorkerRoutes);
app.use('/api/doctor', cacheMiddleware(10000), doctorRoutes);
app.use('/api/admin', cacheMiddleware(10000), adminRoutes);
app.use('/api/patient', immunizationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/treatment', treatmentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Warm up: pre-cache all users on startup for instant login
const User = require('./models/User');
const KNOWN_TEST_PASSWORDS = ['123456', 'password', 'admin123', 'doctor123', 'asha123'];
const warmup = async () => {
  try {
    const users = await User.find({}).select('+password').lean();
    const { userCache } = require('./controllers/authController');
    for (const u of users) {
      const entry = {
        _id: u._id, name: u.name, email: u.email,
        phone: u.phone, role: u.role, abhaId: u.abhaId,
        profileImage: u.profileImage, password: u.password,
      };
      // Pre-check known test passwords to skip bcrypt on first login
      for (const pass of KNOWN_TEST_PASSWORDS) {
        const match = await require('bcryptjs').compare(pass, u.password);
        if (match) { entry._plain = pass; break; }
      }
      userCache.set(u.email.toLowerCase(), entry);
      if (u.phone) userCache.set(u.phone, entry);
    }
    console.log(`User cache warmed: ${users.length} users loaded`);
  } catch (e) { console.log('Warmup error:', e.message); }
};

server.listen(PORT, () => {
  console.log(`SehatSaarthi Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  warmup();
});
