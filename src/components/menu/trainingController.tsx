'use client';

import useAppContext from '@/hooks/providers/AppProvider';
import useSocketContext from '@/hooks/providers/socketProvider';
import {
  convertParamsIA,
  searchParamsIA,
  trainingStorage,
} from '@/interfaces/scrapping';
import { createRouteWithQueries } from '@/routes';
import cn from '@/utils/cn';
import { ErrorToast, InfoToast } from '@/utils/toaster';
import { Textarea } from '@nextui-org/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';
import Button from '../buttons';

const TrainingController = ({ className }: { className?: string }) => {
  const {
    stores: { getTrain },
  } = useAppContext();
  const { ioSocketSend } = useSocketContext();

  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState<string>('');

  const { list, data, idx } = useMemo(() => {
    const value = getTrain() as trainingStorage;
    const { link: currentLinks } =
      (Object.fromEntries(searchParams) as { link: string }) || {};
    const { list, data } = value || {};
    return { list, data, idx: list?.findIndex((v) => v.link === currentLinks) };
  }, [getTrain, searchParams]);

  useEffect(() => {
    const prompt = JSON.stringify({
      messages: [
        {
          role: 'system',
          content: `${list[idx].system} and in other line, explain in French why you get this result`,
        },
        { role: 'user', content: list[idx].prompt },
      ],
    });
    async function copyToClipboard(text: string) {
      try {
        await navigator.clipboard.writeText(text);
        InfoToast({
          text: 'Prompt Copier',
          time: 750,
          pos: 'top-left',
        });
        // eslint-disable-next-line no-empty
      } catch (err) {}
    }
    copyToClipboard(prompt);
    setText('');
  }, [list, idx]);

  const handleChooseNext = useCallback(() => {
    if (idx > data?.total - 1 || !list) {
      return;
    }
    router.push(createRouteWithQueries(path, { link: list[idx + 1].link }));
  }, [idx, data?.total, list, router, path]);

  const handleChoosePrev = useCallback(() => {
    if (idx < 1 || !list) {
      return;
    }
    router.push(createRouteWithQueries(path, { link: list[idx - 1].link }));
  }, [list, idx, path, router]);

  const TextValue = useMemo(() => {
    if (text && (text.length > 4 || text === 'null')) {
      return text;
    }
    return undefined;
  }, [text]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const currentValue = e.target.value;
      setText(currentValue);
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (TextValue) {
      try {
        const valid = JSON.parse(TextValue);
        if (!valid && valid !== null) {
          return ErrorToast({ text: 'Invalid Text' });
        }
        router.prefetch(
          createRouteWithQueries(path, { link: list[idx + 1].link }),
        );
        ioSocketSend({
          name: 'iaTraining',
          value: {
            system: list[idx].system,
            prompt: list[idx].prompt,
            answer:
              valid?.matching >= (data?.searchParams?.matching || 50)
                ? TextValue?.replaceAll('\n', '').trim()
                : 'null',
          },
        });
        router.push(createRouteWithQueries(path, { link: list[idx + 1].link }));
      } catch (error) {
        console.log(error);
        ErrorToast({ text: 'Invalid Text' });
      }
    }
  }, [
    TextValue,
    data?.searchParams?.matching,
    idx,
    ioSocketSend,
    list,
    path,
    router,
  ]);

  const [paramsSearched, jobName] = useMemo(() => {
    if (!data) {
      return [];
    }
    const params = Object?.entries(data?.searchParams).reduce(
      (acc, [key, value]) => {
        const typedKey = key as keyof searchParamsIA;
        if (typedKey === 'Nindustry') {
          return (acc = {
            ...acc,
            company: { ...acc?.company, banned: value },
          });
        }
        if (typedKey === 'industry') {
          return (acc = {
            ...acc,
            company: { ...acc?.company, lookFor: value },
          });
        }
        if (typedKey === 'Nkey') {
          return (acc = { ...acc, key: { ...acc?.key, banned: value } });
        }
        if (typedKey === 'key') {
          return (acc = { ...acc, key: { ...acc?.key, lookFor: value } });
        }
        if (typedKey === 'Nskill') {
          return (acc = { ...acc, skill: { ...acc?.skill, banned: value } });
        }
        if (typedKey === 'skill') {
          return (acc = { ...acc, skill: { ...acc?.skill, lookFor: value } });
        }
        if (typedKey === 'fn') {
          return acc;
        }
        return { ...acc, [typedKey]: value };
      },
      {} as Partial<convertParamsIA>,
    );
    return [params, data?.searchParams.fn[0]];
  }, [data]);

  const cardDisplay = (v: keyof convertParamsIA) => {
    const value =
      paramsSearched as Partial<convertParamsIA> as Partial<convertParamsIA>;

    if (v === 'company') {
      return (
        <>
          <span className="text-center text-p3 text-foreground/90">
            company
          </span>
          <div className="w-full flex flex-col mt-1.5 items-center px-2 space-y-1">
            {value[v]?.lookFor?.map((v, i) => (
              <span className="text-p4 text-validTxt" key={i}>
                {v}
              </span>
            ))}
            {value[v]?.banned?.map((v, i) => (
              <span className="text-p4 text-errorTxt" key={i}>
                {v}
              </span>
            ))}
          </div>
        </>
      );
    }
    if (v === 'key') {
      return (
        <>
          <span className="text-center text-p3 text-foreground/90">
            mots clef
          </span>
          <div className="w-full flex flex-col mt-1.5 items-center px-2 space-y-1">
            {value[v]?.lookFor?.map((v, i) => (
              <span className="text-p4 text-validTxt" key={i}>
                {v}
              </span>
            ))}
            {value[v]?.banned?.map((v, i) => (
              <span className="text-p4 text-errorTxt" key={i}>
                {v}
              </span>
            ))}
          </div>
        </>
      );
    }
    if (v === 'skill') {
      return (
        <>
          <span className="text-center text-p3 text-foreground/90">skills</span>
          <div className="w-full flex flex-col mt-1.5 items-center px-2 space-y-1">
            {value[v]?.lookFor?.map((v, i) => (
              <span className="text-p4 text-validTxt" key={i}>
                {v}
              </span>
            ))}
            {value[v]?.banned?.map((v, i) => (
              <span className="text-p4 text-errorTxt" key={i}>
                {v}
              </span>
            ))}
          </div>
        </>
      );
    }
    if (v === 'formation' || v === 'sector' || v === 'loc') {
      return (
        <>
          <span className="text-center text-p3 text-foreground/90">{v}</span>
          <div className="w-full px-2 mt-1.5 space-y-1">
            {value[v]?.map((v, i) => (
              <span className="text-p3 text-foreground/75" key={i}>
                {v}
              </span>
            ))}
          </div>
        </>
      );
    }
    return (
      <>
        <span className="text-center text-p3 text-foreground/90">{v}</span>
        <span className="text-p3 mt-1.5 text-foreground/75">{value[v]}</span>
      </>
    );
  };

  return (
    <div
      className={cn(
        'w-10/12 bg-content flex flex-col items-center shadow-border rounded-md h-fit p-4',
        className,
      )}
    >
      <div className="w-full flex relative flex-row justify-center items-center">
        <h2 className="text-h3 text-foreground/90">{jobName}</h2>
        <span className="text-p3 absolute top-0 right-0 text-foreground/75">
          {idx + 1}/{data?.total ?? 0 + 1}
        </span>
      </div>
      <div className="flex flex-row justify-around w-[60%] my-8">
        <div
          onClick={handleChoosePrev}
          className={cn(
            'w-10 cursor-pointer mt-1 h-10 hover:opacity-90 rounded-full border-2 border-asset/75',
            {
              '!opacity-60 cursor-not-allowed': idx < 1 || !list,
            },
          )}
        >
          <GrFormPrevious className="w-full h-full" />
        </div>
        <Button
          disabled={!TextValue}
          onClick={handleSubmit}
          className="relative border-asset/75 cursor-pointer font-medium !text-p3 text-white/95 bg-gradient-to-bl from-primary to-secondary rounded-md border-1 h-fit min-h-0 py-2  lg:py-[0.65rem]"
        >
          Envoyer réponse
        </Button>
        <div
          onClick={handleChooseNext}
          className={cn(
            'w-10 cursor-pointer hover:opacity-90 mt-1 h-10 rounded-full border-2 border-asset/75',
            {
              '!opacity-60 cursor-not-allowed': idx > data?.total - 1 || !list,
            },
          )}
        >
          <GrFormNext className="w-full h-full" />
        </div>
      </div>
      <Textarea
        label="IA Reponse learning"
        value={text}
        labelPlacement="outside"
        onChange={handleChange}
        placeholder="Indiquez la bonne réponse"
        classNames={{
          base: 'w-4/5 ',
          inputWrapper:
            '!bg-primary/80 py-1.5 shadow-border border-1 border-transparent hover:shadow-none hover:border-asset/60 px-3 !m-0',
          mainWrapper: '!bg-transparent',
        }}
      ></Textarea>
      {paramsSearched && (
        <div className="w-5/6 mt-8 grid grid-cols-4 gap-6">
          {Object?.keys(paramsSearched).map((v) => (
            <div
              key={v}
              className="w-full h-full p-2 flex flex-col items-center justify-center rounded-md shadow-border"
            >
              {cardDisplay(v as keyof convertParamsIA)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingController;
