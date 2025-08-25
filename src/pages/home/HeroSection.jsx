import React from 'react';
import { Link } from 'react-router-dom';
import img1 from "../../assets/لايت1.png";
import img2 from "../../assets/Asset 12.png";
import img3 from "../../assets/Asset 10.png";
import img4 from "../../assets/Asset 8.png";
import img5 from "../../assets/Asset 9.png";
import img6 from "../../assets/Asset 11.png";
import img7 from "../../assets/Asset 13.png";
import img8 from "../../assets/لايت1_1.png";
import img9 from "../../assets/8646.png";
import img10 from "../../assets/82522.png";
import img11 from "../../assets/864646.png";
import img12 from "../../assets/8131464.png";
import img13 from "../../assets/8646463g.png";
import img14 from "../../assets/8646546.png";

const cards = [
  { id: 1, image: img1, trend: '', title: 'أقمشة' },
  { id: 2, image: img2, trend: '', title: 'غتر' },
  { id: 3, image: img3, trend: '', title: 'محافظ' },
  { id: 4, image: img4, trend: '', title: 'نظارات' },
  { id: 5, image: img5, trend: '', title: 'ساعات' },
  { id: 6, image: img6, trend: '', title: 'اقلام' },
  { id: 7, image: img7, trend: '', title: 'مسباح' },
  { id: 8, image: img8, trend: '', title: 'بوكسات الشهر' },
  { id: 9, image: img9, trend: '', title: 'اكسسوارات' },
  { id: 10, image: img10, trend: '', title: 'كابات' },
  { id: 11, image: img11, trend: '', title: 'شنط رجالية' },
  { id: 12, image: img12, trend: '', title: 'شنط نسائية' },
  { id: 13, image: img13, trend: '', title: 'احذية' },
  { id: 14, image: img14, trend: '', title: 'عطورات' },
];

const HeroSection = () => {
    return (
        <section className='section__container grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4'>
            {cards.map((card) => (
                <Link 
                    to={{
                        pathname: "/shop",
                        search: `?category=${encodeURIComponent(card.title)}`
                    }}
                    key={card.id}
                    className='block aspect-square group'
                >
                    <div className='hero__card relative w-full h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300'>
                        <img 
                            src={card.image} 
                            alt={card.title} 
                            className='absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                        />
                        <div className='absolute inset-0 flex flex-col justify-end'>
                            <div className='bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 text-white text-center'>
                                <p className='text-xs sm:text-sm font-semibold text-gray-300'>{card.trend}</p>
                                <h4 className='text-lg sm:text-xl font-bold mt-1'>{card.title}</h4>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </section>
    );
};

export default HeroSection;