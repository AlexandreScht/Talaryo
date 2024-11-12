/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { createRouteWithQueries } from '@/routes';
import { SliderSlots } from '@nextui-org/react';
import { Slider as NextSlider } from '@nextui-org/slider';
import {
  CustomSliderClassNames,
  SliderClassNames,
  sliderPropsUI,
} from 'next-ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useState,
} from 'react';

const Slider = ({
  defaultValue,
  className,
  min,
  max,
  classNames,
  children,
  ...other
}: sliderPropsUI) => {
  const [value, setValue] = useState<number | number[]>(defaultValue);
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const hasValidSpan = (children: React.ReactNode): boolean => {
    if (!children) {
      return true;
    }
    return Children.toArray(children).some((child) => {
      if (!isValidElement(child)) return false;
      if (child.type === 'span' && child.props['value-slot']) return true;
      if (child.props && child.props.children)
        return hasValidSpan(child.props.children);
      return false;
    });
  };

  const processChildren = (children: React.ReactNode): React.ReactNode => {
    return Children.map(children, (child) => {
      if (!isValidElement(child)) return child;

      if (child.type === 'span' && child.props['value-slot']) {
        return cloneElement(child as React.ReactElement<any>, {
          children: value,
        });
      }

      if (child.props && child.props.children) {
        return cloneElement(child as React.ReactElement<any>, {
          children: processChildren(child.props.children),
        });
      }

      return child;
    });
  };

  if (!hasValidSpan(children)) {
    throw new Error(
      "No <span> with the 'value-slot' property found in children.",
    );
  }

  const handleChoose = useCallback(
    (v: number | number[]) => {
      const oldParams = Object.fromEntries(searchParams);
      router.push(createRouteWithQueries(path, { ...oldParams, matching: v }));
    },
    [path, router, searchParams],
  );

  const processedChildren = processChildren(children);

  return (
    <div className={className}>
      <NextSlider
        minValue={min}
        maxValue={max}
        onChangeEnd={(v: number | number[]) => handleChoose(v)}
        defaultValue={defaultValue}
        onChange={setValue}
        classNames={mergeClasses(classNames)}
        {...other}
        renderThumb={(props) => (
          <div
            {...props}
            className="group transition-size p-0.5 top-1/2 bg-asset border-1 border-foreground/10 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
          >
            <span className="transition-transform bg-foreground shadow-small rounded-full w-5 h-5 block group-data-[dragging=true]:scale-80" />
          </div>
        )}
      />
      {processedChildren}
    </div>
  );
};

function mergeClasses(classNames?: CustomSliderClassNames): SliderClassNames {
  if (!classNames) {
    return undefined;
  }

  const prefixes = {
    dragged: 'data-[dragging=true]:',
    hover: 'data-[hover=true]:',
    pressed: 'data-[pressed=true]:',
    focus: 'data-[focus-visible=true]:',
  };

  const result: SliderClassNames = {};

  const addPrefixedClasses = (
    prefix: string,
    classes: SliderClassNames | undefined,
  ) => {
    if (!classes) return;

    for (const key in classes) {
      if (Object.prototype.hasOwnProperty.call(classes, key)) {
        const slot = key as SliderSlots;
        const originalClassList = classes[slot];

        if (typeof originalClassList === 'string') {
          const classList = originalClassList
            .split(' ')
            .map((cls) => `${prefix}${cls}`)
            .join(' ');

          if (classList) {
            result[slot] = result[slot]
              ? `${result[slot]} ${classList}`
              : classList;
          }
        }
      }
    }
  };

  addPrefixedClasses('', classNames?.default);
  addPrefixedClasses(prefixes.dragged, classNames?.dragged);
  addPrefixedClasses(prefixes.hover, classNames?.hover);
  addPrefixedClasses(prefixes.focus, classNames?.focus);
  addPrefixedClasses(prefixes.pressed, classNames?.pressed);

  return result;
}

export default Slider;
