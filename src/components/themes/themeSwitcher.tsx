'use client';
import cn from '@/utils/cn';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { FaMoon } from 'react-icons/fa';
import { FiSun } from 'react-icons/fi';

const ToggleThemeSwitcher = ({ className }: { className: string }) => {
  const { setTheme, theme } = useTheme();
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (theme === 'light') {
      setIsSelected(true);
    }
  }, [theme]);

  const handleClick = useCallback(() => {
    setIsSelected((prev) => !prev);
  }, []);

  useEffect(() => {
    if (mounted) {
      setTheme(isSelected ? 'light' : 'dark');
    }
  }, [isSelected, mounted, setTheme]);

  return (
    <div
      className={cn(className, 'transition-opacity duration-500', {
        'opacity-0': !mounted,
        'opacity-100': mounted,
      })}
      onClick={handleClick}
    >
      {isSelected ? (
        <FiSun className={'w-full h-full stroke-foreground fill-foreground'} />
      ) : (
        <FaMoon
          className={
            'w-full h-full stroke-foreground fill-foreground py-[0.1rem]'
          }
        />
      )}
    </div>
  );
};

export default ToggleThemeSwitcher;
