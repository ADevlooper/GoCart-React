import { useState } from 'react';

function Shortmenu() {
  const [activeCategory, setActiveCategory] = useState('Gluten-free');

  const categories = [
    'Gluten-free',
    'Without yeast',
    '100% Plant-based ingredients',
    'No added sugars',
    'Lactose-free',
    'Without eggs'
  ];

  const products = {
    'Gluten-free': [
      {
        id: 1,
        title: 'Gluten-Free Chocolate Chip Cookies',
        description: 'Delicious cookies made with almond flour and no gluten.',
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400'
      },
      {
        id: 2,
        title: 'Gluten-Free Brownies',
        description: 'Rich and fudgy brownies that are completely gluten-free.',
        image: 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=400'
      }
    ],
    'Without yeast': [
      {
        id: 1,
        title: 'Yeast-Free Scones',
        description: 'Fluffy scones baked without any yeast.',
        image: 'https://images.unsplash.com/photo-1611337848619-0a468832fcea?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=675'
      },
      {
        id: 2,
        title: 'Yeast-Free Muffins',
        description: 'Moist muffins made without yeast.',
        image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400'
      }
    ],
    '100% Plant-based ingredients': [
      {
        id: 1,
        title: 'Vegan Cupcakes',
        description: 'Cupcakes made with plant-based ingredients only.',
        image: 'https://images.unsplash.com/photo-1693060258764-eb0703f47690?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735'
      },
      {
        id: 2,
        title: 'Plant-Based Cookies',
        description: 'Cookies crafted from 100% plant-based ingredients.',
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400'
      }
    ],
    'No added sugars': [
      {
        id: 1,
        title: 'Sugar-Free Biscuits',
        description: 'Biscuits with no added sugars.',
        image: 'https://plus.unsplash.com/premium_photo-1726072366210-8e83c3406c4b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687'
      },
      {
        id: 2,
        title: 'Natural Sweet Treats',
        description: 'Treats sweetened naturally without added sugars.',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400'
      }
    ],
    'Lactose-free': [
      {
        id: 1,
        title: 'Lactose-Free Cheesecake',
        description: 'Creamy cheesecake without lactose.',
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400'
      },
      {
        id: 2,
        title: 'Dairy-Free Pastries',
        description: 'Pastries free from lactose and dairy.',
        image: 'https://images.unsplash.com/photo-1622941367239-8acd68fa946d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687'
      }
    ],
    'Without eggs': [
      {
        id: 1,
        title: 'Egg-Free Pancakes',
        description: 'Fluffy pancakes made without eggs.',
        image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400'
      },
      {
        id: 2,
        title: 'Vegan Waffles',
        description: 'Crispy waffles without any eggs.',
        image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735'
      }
    ]
  };

  const handleMouseEnter = (category) => {
    setActiveCategory(category);
  };

  return (
    <div className="p-5 font-sans mx-4 ">
      <h1 className="text-left text-3xl md:mt-12 mt-7 md:mb-12 mb-7">Fresh bakes. Fast delivery. Pure happiness!</h1>
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="flex-1 md:mr-5 gap-7">
          <ul className="list-none p-0 md:mt-10 ">
            {categories.map((category) => (
              <li
                key={category}
                className={`md:mb-7 cursor-pointer transition-all duration-300 ${activeCategory === category
                    ? 'text-primary md:text-3xl text-2xl'
                    : 'text-lg md:text-2xl  hover:text-primary hover:text-3xl'
                  }`}
                onMouseEnter={() => handleMouseEnter(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-2 flex flex-col md:flex-row gap-5 mt-8 md:mt-0">
          {products[activeCategory].map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex-1">
              <div className="h-60 bg-gray-200 flex items-center justify-center relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="max-w-full max-h-full object-contain"
                />
                <button className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-lg font-bold text-primary">$10.00</span>
                  <span className="text-sm text-gray-500 line-through">$12.00</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 border-2 border-primary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white transition-colors text-center flex items-center justify-center gap-2 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </button>
                  <button className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors text-center flex items-center justify-center gap-2 text-sm">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Shortmenu;
