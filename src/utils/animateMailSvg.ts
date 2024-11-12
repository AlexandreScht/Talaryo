import cn from './cn';

const svgInLoading = () => {
  const divWrapper = document.createElement('div');
  divWrapper.classList.add('mt-1');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute(
    'class',
    'h-[1.2rem] lg:h-6 xl:h-[1.65rem] w-[1.2rem] lg:w-6 xl:w-[1.65rem] animate-spin',
  );
  svg.setAttribute('viewBox', '0 0 133 133');

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('stroke', 'none');
  g.setAttribute('stroke-width', '1');
  g.setAttribute('fill', 'none');
  g.setAttribute('fill-rule', 'evenodd');

  svg.appendChild(g);

  const inlineColor = ['fill-none', 'fill-content'];
  inlineColor.map((color) => {
    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    circle.setAttribute('class', color);
    circle.setAttribute('cx', '66.5');
    circle.setAttribute('cy', '66.5');
    circle.setAttribute('r', '55.5');
    g.appendChild(circle);
  });

  const outlineColor = ['stroke-asset/80', 'stroke-special'];
  outlineColor.map((color) => {
    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    circle.setAttribute('class', `${color} transition-opacity duration-250`);
    if (color === 'stroke-special') {
      circle.setAttribute('style', 'stroke-dasharray: 75px, 345.576px;');
    }
    circle.setAttribute('stroke-width', '7');
    circle.setAttribute('cx', '66.5');
    circle.setAttribute('cy', '66.5');
    circle.setAttribute('r', '54.5');
    g.appendChild(circle);
  });

  divWrapper.appendChild(svg);
  return divWrapper;
};

type action = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  canCopy: boolean,
) => void;

const CreateBtn = (
  mail: string,
  err: boolean,
  action: action,
  canCopy: boolean,
) => {
  const buttonMail = document.createElement('button');
  buttonMail.className = cn(
    'w-fit min-w-0 max-w-full overflow-hidden relative hover:scale-[1.03] hover:translate-x-1 z-10 mt-1 h-[1.2rem] lg:h-6 xl:h-[1.65rem] transition-transform rounded-md flex items-center px-2 border-[1px] !text-i1 border-errorTxt/60 bg-errorBg/40 text-foreground/80',
    { 'border-secondary/60 bg-successBg/40': !err },
  );
  const buttonText = document.createElement('span');
  buttonText.className =
    'line-clamp-1 max-w-full text-ellipsis overflow-hidden break-words whitespace-nowrap';
  buttonText.textContent = mail || 'Email Introuvable';
  buttonMail.appendChild(buttonText);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buttonMail.onclick = (e) => action(e as any, canCopy);
  return buttonMail;
};

const animateFetch = (el: Element, success: boolean) => {
  const [nextInline, defaultInline, circle, lineCircle] = Array.from(
    el.children,
  );
  lineCircle.classList.add('lineCircle');
  nextInline.classList.remove('fill-none');
  nextInline.classList.add(success ? 'fill-secondary/75' : 'fill-errorTxt/75');
  defaultInline.classList.add('removeCircleBg');
  const polyline = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'polyline',
  );
  polyline.setAttribute('stroke', '#FFFFFF');
  polyline.setAttribute(
    'style',
    'stroke-dasharray: 0, 75px; stroke-linecap: round; stroke-linejoin: round;',
  );
  polyline.setAttribute('class', 'circleIconDisplay');
  polyline.setAttribute('stroke-width', '6');
  polyline.setAttribute(
    'points',
    success ? '41 70 56 85 92 49' : '41 41, 92 92',
  );
  if (success) {
    return [polyline, circle, lineCircle];
  }
  const polylineB = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'polyline',
  );
  polylineB.setAttribute('stroke', '#FFFFFF');
  polylineB.setAttribute(
    'style',
    'stroke-dasharray: 0, 75px; stroke-linecap: round; stroke-linejoin: round;',
  );
  polylineB.setAttribute('class', 'circleIconDisplay');
  polylineB.setAttribute('stroke-width', '6');
  polylineB.setAttribute('points', '92 41, 41 92');
  return [polyline, polylineB, circle, lineCircle];
};

export const svgMailSuccess = (el: HTMLDivElement): Promise<void> => {
  return new Promise((resolve) => {
    const svgElement = el.children.item(0);
    const gElement = svgElement?.children.item(0);
    if (gElement) {
      const [polyline, circle, lineCircle] = animateFetch(gElement, true);
      gElement.appendChild(polyline);
      gElement.classList.add('circleGroup');

      setTimeout(() => {
        svgElement?.classList.remove('animate-spin');
        circle.classList.add('hidden');
        lineCircle.classList.add('opacity-0');

        setTimeout(() => {
          svgElement?.classList.add('hidden');
          resolve();
        }, 2500);
      }, 400);
    } else {
      resolve(); // Resolve immediately if gElement is not found
    }
  });
};

export const svgMailFailed = (
  el: HTMLDivElement,
  msg: string,
  action: action,
  canCopy: boolean,
): void => {
  const svgElement = el.children.item(0);
  const gElement = svgElement?.children.item(0);
  if (gElement) {
    const [polylineA, polylineB, circle, lineCircle] = animateFetch(
      gElement,
      false,
    );
    gElement.appendChild(polylineA);
    gElement.appendChild(polylineB);
    gElement.classList.add('circleGroup');
    setTimeout(() => {
      svgElement?.classList.remove('animate-spin');
      circle.classList.add('hidden');
      lineCircle.classList.add('opacity-0');
    }, 400);
    setTimeout(() => {
      const buttonMail = CreateBtn(msg, true, action, canCopy);
      el.appendChild(buttonMail);
      svgElement?.classList.add('hidden');
    }, 2700);
  }
};

export const startMailAnimation = (el: EventTarget & HTMLButtonElement) => {
  Array.from(el.children).forEach((child) => child.classList.add('opacity-0'));
  el.className = cn(
    el.className,
    'rounded-full w-[1.2rem] lg:w-6 xl:w-[1.65rem]',
  );

  const divWrapper = svgInLoading();

  setTimeout(() => {
    el.className = cn(el.className, 'hidden');
    el.parentElement?.appendChild(divWrapper);
  }, 255);

  return divWrapper;
};
