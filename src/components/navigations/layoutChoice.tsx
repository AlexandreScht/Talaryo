'use client';
import cn from '@/utils/cn';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const LayoutChoice = ({ Positions }: { Positions: Record<string, string> }) => {
  const pathName = usePathname();

  const posY = useMemo(() => {
    return Positions[`/${pathName.split('/')[1]}`] || Positions[`/${pathName.split('/').slice(1, 3).join('/')}`];
  }, [Positions, pathName]);

  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(`transition-all duration-250 absolute ${posY} left-0 w-6 h-6`, {
        hidden: !posY,
      })}
    >
      <div className="md:w-5/6 lg:w-full xl:w-[120%] md:h-5/6 lg:h-full xl:h-[120%] rotate-45 -translate-x-[49%] rounded-tr-md bg-gradient-to-tr from-special to-secondary"></div>
    </motion.div>
  );
};

export default LayoutChoice;
