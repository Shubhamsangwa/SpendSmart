
const CATEGORY_RULES = [
  {
    name: 'Food',
    keywords: [
      'pizza', 'lunch', 'dinner', 'breakfast', 'eat', 'burger', 'food',
      'drink', 'sprite', 'mcdonald', 'momo', 'restaurant', 'cafe', 'coffee',
      'tea', 'snack', 'swiggy', 'zomato', 'biryani', 'noodles', 'sandwich',
      'icecream', 'ice cream', 'juice', 'milk', 'grocery', 'groceries',
      'vegetables', 'fruits', 'bread', 'dal', 'rice', 'dominos', 'kfc',
      'subway', 'barbeque', 'bbq', 'halwai', 'mithai', 'sweet', 'vegetables', 'fruits', 'bread', 'dal', 'rice', 'dominos', 'kfc',
    ],
  },
  {
    name: 'Travel',
    keywords: [
      'uber', 'ola', 'travel', 'bus', 'train', 'auto', 'rickshaw', 'taxi',
      'flight', 'airport', 'metro', 'toll', 'petrol', 'diesel', 'fuel',
      'bike', 'rapido', 'cab', 'ticket', 'station', 'irctc', 'jaipur',
      'delhi', 'mumbai', 'bangalore', 'trip', 'tour', 'hotel', 'hostel',
    ],
  },
  {
    name: 'Health',
    keywords: [
      'gym', 'health', 'skin', 'doctor', 'hospital', 'medicine', 'clinic',
      'sick', 'pharmacy', 'chemist', 'tablet', 'injection', 'physiotherapy',
      'yoga', 'meditation', 'protein', 'supplement', 'dental', 'eyecare',
      'spectacles', 'blood test', 'lab', 'checkup', 'ambulance', 'surgery',
    ],
  },
  {
    name: 'Entertainment',
    keywords: [
      'movie', 'netflix', 'prime', 'hotstar', 'spotify', 'youtube', 'game',
      'gaming', 'concert', 'event', 'show', 'theatre', 'park', 'museum',
      'zoo', 'fun', 'bowling', 'chess', 'pubg', 'steam', 'playstore',
      'subscription', 'bookmyshow', 'pvr', 'inox',
    ],
  },
  {
    name: 'Shopping',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'meesho', 'clothes', 'shirt', 'shoes',
      'bag', 'watch', 'accessories', 'fashion', 'mall', 'market', 'shopping',
      'purchase', 'buy', 'stationary', 'pen', 'notebook', 'book', 'earphones',
      'mobile', 'charger', 'electronics', 'appliance',
    ],
  },
  {
    name: 'Bills',
    keywords: [
      'rent', 'electricity', 'water', 'wifi', 'internet', 'broadband',
      'mobile recharge', 'recharge', 'sim', 'gas', 'lpg', 'emi', 'loan',
      'insurance', 'premium', 'postpaid', 'prepaid', 'bill', 'maintenance',
    ],
  },
];

/**
 * @param {string} description
 * @returns {string} category name
 */
function categorizeExpense(description) {
  if (!description || typeof description !== 'string') return 'Others';

  const lower = description.toLowerCase();

  let bestCategory = 'Others';
  let bestScore    = 0;

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        // Longer keyword = more specific = higher score
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore    = score;
      bestCategory = rule.name;
    }
  }

  return bestCategory;
}

module.exports = categorizeExpense;