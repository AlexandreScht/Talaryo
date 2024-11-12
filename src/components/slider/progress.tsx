import cn from '@/utils/cn';
import { Progress } from '@nextui-org/progress';

const ProgressBar = ({
  value,
  total,
  className,
}: {
  value: number;
  total: number;
  className?: string;
}) => {
  const percentage = (value / total) * 100;
  return (
    <div className={cn('w-full', className)}>
      <Progress
        aria-labelledby="pourcentage de progression dans le plan actuel"
        classNames={{
          base: 'max-w-md bg-transparent mb-1 lg:mb-0',
          track:
            'bg-foreground/90 min-h-0 !h-1 lg:!h-1.5 xl:!h-[0.45rem] border-none',
          indicator: 'bg-gradient-to-r from-secondary to-special',
        }}
        value={percentage}
      />
    </div>
  );
};

export default ProgressBar;
