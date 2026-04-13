import slide1 from '../assets/slide-1.svg';
import slide2 from '../assets/slide-2.svg';
import slide3 from '../assets/slide-3.svg';

export const postImageOptions = [
  { value: 'slide-1', label: 'Slide 1' },
  { value: 'slide-2', label: 'Slide 2' },
  { value: 'slide-3', label: 'Slide 3' },
];

export const postImageMap = {
  'slide-1': slide1,
  'slide-2': slide2,
  'slide-3': slide3,
};

export const productImageOptions = [
  { value: 'cover', label: 'Phone Cover' },
  { value: 'glass', label: 'Temper Glass' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'charger', label: 'Charger' },
];

export const productIconMap = {
  cover: '📱',
  glass: '✨',
  headphones: '🎧',
  charger: '⚡',
};

export const defaultContent = {
  posts: [
    {
      id: 'post-1',
      title: 'Weekend Flash Deal',
      description: 'Limited-time buy 2 get 1 offer for selected mobile accessories.',
      price: '₹299',
      imageKey: 'slide-1',
      imageUrl: '',
    },
    {
      id: 'post-2',
      title: 'Repair Before & After',
      description: 'See how fast screen replacement and battery service look in action.',
      price: '₹199',
      imageKey: 'slide-2',
      imageUrl: '',
    },
    {
      id: 'post-3',
      title: 'New Cover Collection',
      description: 'Fresh phone cover styles now visible in our latest post feed.',
      price: '₹349',
      imageKey: 'slide-3',
      imageUrl: '',
    },
    {
      id: 'post-4',
      title: 'Charging Combo Post',
      description: 'Bundle deals for charger, cable, and screen guard are now live.',
      price: '₹499',
      imageKey: 'slide-1',
      imageUrl: '',
    },
    {
      id: 'post-5',
      title: 'Quick Service Update',
      description: 'Book your repair slot directly from the latest Instagram-style cards.',
      price: '₹249',
      imageKey: 'slide-2',
      imageUrl: '',
    },
    {
      id: 'post-6',
      title: 'Trending Audio Gear',
      description: 'Explore Bluetooth speakers, earphones, and more in the feed.',
      price: '₹599',
      imageKey: 'slide-3',
      imageUrl: '',
    },
  ],
  products: [
    {
      id: 'product-1',
      title: 'Aura Shield Cover',
      model: 'UltraGrip 2025',
      price: '₹349',
      category: 'Phone Cover',
      description: 'Soft-touch finish with shock protection.',
      imageKey: 'cover',
      imageUrl: '',
    },
    {
      id: 'product-2',
      title: 'Crystal Temper Glass',
      model: 'EdgeSafe',
      price: '₹149',
      category: 'Temper Glass',
      description: '9H hardness, bubble-free installation.',
      imageKey: 'glass',
      imageUrl: '',
    },
    {
      id: 'product-3',
      title: 'StudioSound Headphones',
      model: 'SUBI Beats',
      price: '₹799',
      category: 'Headphones',
      description: 'Comfort fit with powerful bass.',
      imageKey: 'headphones',
      imageUrl: '',
    },
    {
      id: 'product-4',
      title: 'Turbo Charge Adapter',
      model: 'PowerBolt 30W',
      price: '₹499',
      category: 'Chargers',
      description: 'Fast charging with overheat protection.',
      imageKey: 'charger',
      imageUrl: '',
    },
  ],
  services: [
    {
      id: 'service-1',
      title: 'Screen Repair',
      description: 'Fast repair for cracked glass, touchscreen replacement and pixel recovery.',
      imageUrl: '',
    },
    {
      id: 'service-2',
      title: 'Battery Replacement',
      description: 'Authentic battery swaps with tested power management support.',
      imageUrl: '',
    },
    {
      id: 'service-3',
      title: 'Software Tune-up',
      description: 'Performance boost, storage cleanup and battery optimization.',
      imageUrl: '',
    },
    {
      id: 'service-4',
      title: 'Water Damage Check',
      description: 'Detailed inspection and safe recovery for liquid-exposed devices.',
      imageUrl: '',
    },
  ],
  jobs: [
    {
      id: 'job-1',
      title: 'Sales Executive',
      description: 'Help customers choose the best mobile accessories and build trust with each interaction.',
      qualification: '12th pass / Retail experience preferred',
      date: 'Apply by Apr 25',
      imageUrl: '',
    },
    {
      id: 'job-2',
      title: 'Service Technician',
      description: 'Diagnose and repair mobile devices, handle replacement parts with precision.',
      qualification: 'Diploma / Mobile repair experience',
      date: 'Apply by Apr 28',
      imageUrl: '',
    },
    {
      id: 'job-3',
      title: 'Delivery Associate',
      description: 'Fast local delivery for accessories and service pickups with friendly customer support.',
      qualification: 'Valid license, punctual, smartphone-savvy',
      date: 'Apply by May 3',
      imageUrl: '',
    },
  ],
  serviceForm: {
    title: 'Service Request',
    description: 'Quick, clean and easy request entry for repair or installation support.',
    heading: 'Tell us what your device needs.',
    fields: [
      {
        id: 'name',
        name: 'name',
        label: 'Name',
        type: 'text',
        placeholder: 'Enter your name',
        required: true,
        options: [],
      },
      {
        id: 'phone',
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter your phone number',
        required: true,
        options: [],
      },
      {
        id: 'service',
        name: 'service',
        label: 'Select Service',
        type: 'select',
        placeholder: '',
        required: true,
        options: ['Screen Repair', 'Battery Replacement', 'Software Tune-up', 'Accessory Installation'],
      },
      {
        id: 'details',
        name: 'details',
        label: 'Issue Description',
        type: 'textarea',
        placeholder: 'Describe the issue in a few words',
        required: true,
        options: [],
      },
    ],
    submitLabel: 'Submit Request',
  },
};

export function cloneDefaultContent() {
  return structuredClone(defaultContent);
}
