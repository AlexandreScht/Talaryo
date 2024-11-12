import ProgressBar from '@/components/slider/progress';
import cn from '@/utils/cn';
import { IconType } from 'react-icons';
import { CgInfinity } from 'react-icons/cg';

const LimitPlan = ({
  icon,
  label,
  value,
  total,
  className,
}: {
  icon: IconType;
  value?: number;
  total?: number;
  label: string;
  className?: string;
}) => {
  return (value || value === 0) && total ? (
    <div className="w-full h-hull bg-content border-1 border-asset/20 flex flex-col justify-between rounded-lg py-1.5 px-2 lg:py-2.5 lg:px-3">
      <div className="w-full flex flex-row">
        <div className="w-6 h-6 lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-full bg-special mr-3.5 p-2">
          {icon({
            className: 'w-full h-full scale-150 lg:scale-100 text-foreground invert',
          })}
        </div>
        <div className="flex-1 flex flex-col">
          <span className="text-i2">{label}</span>
          <span className="text-p2 font-semibold flex flex-row">
            {value}/{total === Infinity ? <CgInfinity className="w-fit h-[1.15rem] lg:h-[1.4rem] xl:h-7 ml-0.5 -mt-0.5" /> : total}
          </span>
        </div>
      </div>
      <ProgressBar className={cn(className, { 'opacity-50': total === Infinity })} value={value} total={total} />
    </div>
  ) : (
    <div className="w-full h-hull bg-content flex flex-col justify-center rounded-lg py-2.5 px-3">
      <p className="text-i1 text-foreground/90 text-center">Une erreur est survenue, veuillez réessayer plus tard</p>
    </div>
  );
};

export default LimitPlan;
