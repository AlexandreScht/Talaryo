// import NextTopLoader from 'nextjs-toploader';
import React from 'react';

const Loading = () => {
  return (
    <main>
      <div className="w-full h-screen fixed z-[99991] top-0 bg-background flex flex-col justify-center items-center">
        <div className="pulseLoader w-14 h-14"></div>
        <span className="shiny mt-5 text-h3 font-semibold">chargement</span>
      </div>
    </main>
  );
};

export default Loading;
