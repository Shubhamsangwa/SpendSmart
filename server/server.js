require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const Expense    = require('./models/Expense');
const categorizeExpense = require('./utils/categorizeExpense');

const app = express();
app.use(cors());
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB error:', err));


app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'SpendSmart API is running 🚀' });
});

app.use('/auth', authRoutes);

// ── Protected routes (require valid JWT) 
app.use(authMiddleware);   // everything below this line requires login

// Add expense
app.post('/expense', async (req, res) => {
  try {
    const { amount, description, category: userCategory } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return res.status(400).json({ message: 'Amount must be a positive number.' });
    if (!description || !description.trim())
      return res.status(400).json({ message: 'Description is required.' });

    const category =
      userCategory && userCategory !== 'Pending'
        ? userCategory
        : categorizeExpense(description);

    // Tie expense to logged-in user
    const expense = new Expense({
      userId: req.userId,
      amount: Number(amount),
      description: description.trim(),
      category,
    });
    await expense.save();

    res.status(201).json({ message: 'Expense saved ✅', expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expenses (only current user's)
app.get('/expenses', async (req, res) => {
  try {
    const { category, month, search } = req.query;
    const query = { userId: req.userId };

    if (category && category !== 'All') query.category = category;

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      query.createdAt = {
        $gte: new Date(year, mon - 1, 1),
        $lte: new Date(year, mon, 0, 23, 59, 59),
      };
    }

    if (search) query.description = { $regex: search, $options: 'i' };

    const expenses = await Expense.find(query).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Summary / analytics
app.get('/expenses/summary', async (req, res) => {
  try {
    const { month } = req.query;
    const matchStage = { userId: new mongoose.Types.ObjectId(req.userId) };

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      matchStage.createdAt = {
        $gte: new Date(year, mon - 1, 1),
        $lte: new Date(year, mon, 0, 23, 59, 59),
      };
    }

    const summary = await Expense.aggregate([
      { $match: matchStage },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const totalAmount = summary.reduce((a, s) => a + s.total, 0);
    const totalCount  = summary.reduce((a, s) => a + s.count, 0);

    res.json({
      byCategory: summary,
      totalAmount,
      totalCount,
      averagePerExpense: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete expense
app.delete('/expense/:id', async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Expense not found.' });
    res.json({ message: 'Expense deleted ✅' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update expense
app.put('/expense/:id', async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { amount, description, category },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Expense not found.' });
    res.json({ message: 'Expense updated ✅', expense: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SpendSmart server running on port ${PORT}`));