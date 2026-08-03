import React from 'react'

const InfoCard = ({icon,label,value,color}) => {
  return (
    <div className='flex items-center gap-3 '>
        <div className={`${color} w-2 h-3 md:w-2 rounded-full`}/>
            <p className='text-xs md:text-[14px]  text-gray-500'>
                <span className='text-sm text-black md:text-[14px] font-semibold'>{value} </span>{label}
                </p>
    </div>
  )
}

export default InfoCard