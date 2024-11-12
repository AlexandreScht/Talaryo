import TrainingController from '@/components/menu/trainingController';
import React from 'react';

const TrainingIo = ({ link }: { link: string }) => {
  return (
    <section className="w-full h-[100vh] grid grid-cols-7 grid-rows-1 gap-x-4">
      <div className="w-full col-span-4 flex flex-col h-full">
        <embed
          className="h-full"
          src={link}
          type="application/pdf"
          width="full"
        />
      </div>
      <div className="w-full col-span-3 flex items-center justify-center">
        <TrainingController />
      </div>
    </section>
  );
};

export default TrainingIo;
