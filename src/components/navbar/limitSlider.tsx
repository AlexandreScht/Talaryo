import cn from '@/utils/cn';

const LimitSlider = ({ progression }: { progression: number }) => {
  return (
    <aside className="fixed flex left-0 top-0 h-1.5 z-10 w-full">
      <div
        className={cn(
          'h-full bg-gradient-to-r from-primary/60 to-secondary/50 transition-all duration-250',
          {
            'bg-gradient-to-r from-primary/60 to-secondary/60':
              progression > 25,
          },
          {
            'bg-gradient-to-r from-primary/70 to-secondary/75':
              progression > 50,
          },
          {
            'bg-gradient-to-r from-primary/75 to-secondary/90':
              progression > 75,
          },
          {
            'bg-gradient-to-r from-primary/75 to-secondary': progression > 100,
          },
        )}
        style={{ width: `${progression}%` }}
      ></div>
      <div className="h-full bg-transparent flex-1"></div>
    </aside>
  );
};

export default LimitSlider;
