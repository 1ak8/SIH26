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

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(helmet());
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('join', (room) => { socket.join(room); });
  socket.on('disconnect', () => { console.log(`Socket disconnected: ${socket.id}`); });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'AarogyaNet Backend', timestamp: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/health-worker', healthWorkerRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`AarogyaNet Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
