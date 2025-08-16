import React, { useEffect, useState } from 'react';
import card1 from "../../assets/SUBS1.jpg";
import card2 from "../../assets/SUBS2.png";
import card3 from "../../assets/SUBS3.png";
import { FaCircleCheck } from "react-icons/fa6";

const Subscription = () => {


    return (
        <div>
            
            {/* header */}
            <div className='flex items-center justify-between'>
                <h1 className='text-xl font-semibold'>Subscription</h1>
                <button className='bg-primary text-white h-10 px-4 rounded-md'>Create Subscription</button>
            </div>
        </div>
    )
}

export default Subscription