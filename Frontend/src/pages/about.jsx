

function About() {
  return (
    <div className="p-5 font-sans mx-4">
      <h1 className="text-center text-4xl mt-12 mb-12">About Us</h1>
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-lg mb-6">
          Welcome to GoCart, where passion for baking meets commitment to health and sustainability.
          We specialize in creating delicious, high-quality baked goods that cater to various dietary needs
          and preferences.
        </p>
        <p className="text-lg mb-6">
          Our mission is to provide you with mouth-watering treats that are not only tasty but also
          mindful of your health choices. From gluten-free delights to plant-based wonders, we ensure
          every bite is a celebration of flavor and wellness.
        </p>
        <p className="text-lg mb-6">
          At GoCart, we believe that great taste and healthy living can go hand in hand. Join us
          in our journey to redefine the world of baking, one delicious bite at a time.
        </p>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-red-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Quality Ingredients</h3>
            <p>We use only the finest, natural ingredients to create our baked goods.</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Diverse Options</h3>
            <p>From gluten-free to vegan, we have options for every dietary preference.</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Sustainable Practices</h3>
            <p>We're committed to eco-friendly packaging and sustainable sourcing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
