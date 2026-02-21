import { MenuItem } from '../types';

export const MENU_ITEMS: MenuItem[] = [
  // --- SIGNATURE MAINS ---
  {
    id: 'm1',
    name: 'Classic Cheese Burger',
    description: 'Aged beef patty, melted cheddar, house-made pickles, and secret sauce on a toasted brioche bun.',
    price: 18.50,
    category: 'Mains',
    image: '/images/chessBurger.jpeg',
  },
  {
    id: 'm2',
    name: 'Margherita Pizza',
    description: 'Authentic thin-crust pizza with fresh mozzarella, vine-ripened tomatoes, and organic basil.',
    price: 22.00,
    category: 'Mains',
    image: '/images/MargheritaPizza.jpg',
  },
  {
    id: 'm3',
    name: 'Classic Caesar Salad',
    description: 'Crisp romaine lettuce, house-made sourdough croutons, and aged Parmigiano-Reggiano.',
    price: 16.00,
    category: 'Salads',
    image: '/images/CaesarSalad.jpg',
  },

  // --- ARTISANAL SIDES ---
  {
    id: 'si1',
    name: 'Golden French Fries',
    description: 'Hand-cut potatoes, double-fried for the perfect crunch, seasoned with sea salt.',
    price: 8.00,
    category: 'Sides',
    image: '/images/FrenchFries.jpg',
  },

  // --- EXQUISITE DESSERTS ---
  {
    id: 'd1',
    name: 'Chocolate Brownies',
    description: 'Rich, fudgy dark chocolate brownies served with a drizzle of salted caramel.',
    price: 12.00,
    category: 'Desserts',
    image: '/images/ChocolateBrownies.webp',
  },

  // --- CURATED DRINKS ---
  {
    id: 'dr1',
    name: 'House Iced Tea',
    description: 'Premium black tea leaves cold-brewed for 12 hours with a hint of lemon and mint.',
    price: 6.00,
    category: 'Drinks',
    image: '/images/IceTea.webp',
  },
];
