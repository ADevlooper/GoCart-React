import { useState, useEffect } from 'react';

function Adcorousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        {
            id: 1,
            image:'https://images.unsplash.com/photo-1700245464774-555b14979a20?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1333',
            title: 'Celebrate the Festival of lights !',
            description: 'Grand Diwali Sale On Live ❤️ Get 20% Off On All Orders Above $50',
            buttonText: 'Order now !'
        },
        {
            id: 2,
             image:"https://images.unsplash.com/photo-1587855049254-351f4e55fe2a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1300",
            title: 'Step into the Festive Season!',
            description: 'From sneakers to stilettos, celebrate every step with festival offers!',
            buttonText: 'Explore'
        },
        {
            id: 3,
            image: 'https://plus.unsplash.com/premium_photo-1758334817227-1e54bb8f5ad8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074',
            title: 'Festive Upgrade Fiesta!',
            description: 'From smart gadgets to stylish furniture, enjoy festive deals that light up every corner of your home!',
            buttonText: 'Explore'
        },
    ];

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 3000); // Change slide every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full overflow-hidden h-[70vh] bg-gray-900">
            <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {slides.map((slide, index) => (
                    <div key={slide.id} className="flex-shrink-0 w-full  h-full relative bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}>
                        <div className={`absolute inset-0 flex items-center ${index === 0 ? 'justify-center' : index === 1 ? 'justify-end mr-[10%]' : 'justify-start ml-[10%]'}`}>
                            <div className={`text-white ${index === 0 ? 'text-center' : 'text-left'} max-w-lg px-2 flex flex-col`}>
                                <h2 className={`text-2xl md:text-4xl font-bold mb-4 animate-fade-in ${index === 0 ? 'whitespace-nowrap' : ''}`}>{slide.title}</h2>
                                <p className="text-md md:text-xl mb-4 animate-fade-in delay-200">{slide.description}</p>
                                <button className={`bg-white text-black px-5 md:px-8 py-2 md:py-3 rounded-md font-semibold transition-all duration-300 transform hover:scale-105 ${index === 0 ? 'self-center' : 'self-start'}`}>
                                    {slide.buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/100 backdrop-blur-sm text-black md:p-3 p-2  rounded-full  transition-all duration-300"
            >
                &#10094;
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/100 backdrop-blur-sm text-black md:p-3 p-2  rounded-full  transition-all duration-300"
            >
                &#10095;
            </button>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`md:w-4 w-2 md:h-4 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white scale-125' : 'bg-white bg-opacity-50 hover:bg-opacity-75'}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default Adcorousel;
