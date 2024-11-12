import cn from '@/utils/cn';

export const FilledFolder = ({
  childCount,
  className,
}: {
  childCount?: number;
  className?: string;
}) => (
  <div className={cn('relative', className)}>
    <svg className="w-full h-full" viewBox="0 0 136 99" fill="none">
      <path
        d="M0 14.4878H121.833C129.657 14.4878 136 19.8931 136 26.561V86.9268C136 93.5947 129.657 99 121.833 99H68H14.1667C6.34264 99 0 93.5947 0 86.9268V14.4878Z"
        fill="#496EE9"
      />
      <path
        d="M0 32.5976V82.0976C0 88.7654 6.34264 94.1707 14.1667 94.1707H121.833C129.657 94.1707 136 88.7654 136 82.0976V31.3902C136 24.7224 129.657 19.3171 121.833 19.3171H62.3333V25.3537C62.3333 29.3544 58.5277 32.5976 53.8333 32.5976H0Z"
        fill="url(#paint0_linear_110_10643)"
      />
      <path
        d="M0 9.65854C0 4.32428 5.07411 0 11.3333 0H51C57.2592 0 62.3333 4.32428 62.3333 9.65854V14.4878H0V9.65854Z"
        fill="#496EE9"
      />
      <defs>
        <linearGradient
          id="paint0_linear_110_10643"
          x1="0"
          y1="0"
          x2="163.6"
          y2="115.022"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#56BBF1" />
          <stop offset="1" stopColor="#4D77FF" />
        </linearGradient>
      </defs>
    </svg>
    {childCount && (
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-2 ml-0.5 text-ellipsis overflow-hidden w-32 text-center -translate-y-1/2 text-foreground/90 font-semibold text-h2">
        {childCount.toLocaleString()}
      </span>
    )}
  </div>
);
