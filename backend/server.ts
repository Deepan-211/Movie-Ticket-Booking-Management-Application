import express from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// SLA Cron Job
cron.schedule('0 * * * *', async () => {
  // Runs every hour
  console.log('Running SLA check...');
  const now = new Date();
  
  // A real implementation would flag statuses or send alerts.
  // For now, we are dynamically checking SLA on the frontend based on createdAt.
});

// Dummy Email setup (Ethereal)
const sendEmail = async (to: string, subject: string, text: string) => {
  console.log(`[EMAIL to ${to}]: ${subject}\n${text}`);
  // In a real app we would use nodemailer createTransport here
};

app.get('/api/movies', async (req, res) => {
  const movies = await prisma.movie.findMany();
  res.json(movies);
});

app.post('/api/movies', async (req, res) => {
  const movie = await prisma.movie.create({ data: req.body });
  res.json(movie);
});

app.put('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  const movie = await prisma.movie.update({ where: { id: Number(id) }, data: req.body });
  res.json(movie);
});

app.delete('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  // Delete related shows and bookings first
  const shows = await prisma.show.findMany({ where: { movieId: Number(id) } });
  for (const show of shows) {
    await prisma.bookingRequest.deleteMany({ where: { showId: show.id } });
  }
  await prisma.show.deleteMany({ where: { movieId: Number(id) } });
  await prisma.movie.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});

app.get('/api/shows', async (req, res) => {
  const shows = await prisma.show.findMany({ include: { movie: true } });
  res.json(shows);
});

app.post('/api/shows', async (req, res) => {
  const show = await prisma.show.create({ data: {
    ...req.body,
    dateTime: new Date(req.body.dateTime)
  } });
  res.json(show);
});

app.put('/api/shows/:id', async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };
  if (data.dateTime) data.dateTime = new Date(data.dateTime);
  const show = await prisma.show.update({ where: { id: Number(id) }, data });
  res.json(show);
});

app.delete('/api/shows/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.bookingRequest.deleteMany({ where: { showId: Number(id) } });
  await prisma.show.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});

app.get('/api/bookings', async (req, res) => {
  const bookings = await prisma.bookingRequest.findMany({ include: { show: { include: { movie: true } } } });
  res.json(bookings);
});

app.post('/api/bookings', async (req, res) => {
  const { customerName, customerEmail, showId, numTickets } = req.body;
  const show = await prisma.show.findUnique({ where: { id: showId }, include: { movie: true } });
  
  if (!show) return res.status(404).json({ error: 'Show not found' });
  if (show.seatsAvailable < numTickets) return res.status(400).json({ error: 'Not enough seats available' });

  const totalCost = show.pricePerSeat * numTickets;
  const assignedQueue = ['Premium', '3D'].includes(show.movie.showType) ? 'PremiumShowQueue' : 'StandardShowQueue';

  const booking = await prisma.bookingRequest.create({
    data: {
      customerName,
      customerEmail,
      showId,
      numTickets,
      totalCost,
      status: 'Initial Stage',
      assignedQueue
    }
  });
  res.json(booking);
});

app.put('/api/bookings/:id/confirm', async (req, res) => {
  const { id } = req.params;
  const booking = await prisma.bookingRequest.update({
    where: { id: Number(id) },
    data: { confirmed: true, status: 'Approval' }
  });
  res.json(booking);
});

app.put('/api/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body; // 'approve' | 'reject'
  
  const booking = await prisma.bookingRequest.findUnique({ where: { id: Number(id) }, include: { show: true } });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  
  if (action === 'approve') {
    await prisma.show.update({
      where: { id: booking.showId },
      data: { seatsAvailable: { decrement: booking.numTickets } }
    });
    const updated = await prisma.bookingRequest.update({
      where: { id: Number(id) },
      data: { status: 'Resolved', resolvedAt: new Date() }
    });
    await sendEmail(updated.customerEmail, 'Booking Approved', 'Your booking is confirmed.');
    res.json(updated);
  } else {
    const updated = await prisma.bookingRequest.update({
      where: { id: Number(id) },
      data: { status: 'Rejected', resolvedAt: new Date(), rejectionReason }
    });
    await sendEmail(updated.customerEmail, 'Booking Rejected', `Your booking was rejected. Reason: ${rejectionReason}`);
    res.json(updated);
  }
});

// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
