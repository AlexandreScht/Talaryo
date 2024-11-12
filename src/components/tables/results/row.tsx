'use client';

import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import { mainParams } from '@/interfaces/components';
import { visited } from '@/interfaces/scores';
import {
  emailProps,
  scrappingCVProps,
  scrappingInfos,
  scrappingReseauProps,
} from '@/interfaces/scrapping';
import {
  startMailAnimation,
  svgMailFailed,
  svgMailSuccess,
} from '@/utils/animateMailSvg';
import cn from '@/utils/cn';
import { InfoToast } from '@/utils/toaster';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import copy from 'copy-text-to-clipboard';
import Image from 'next/image';
import Link from 'next/link';
import pako from 'pako';
import { useCallback, useMemo, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { AiFillStar, AiOutlineFilePdf } from 'react-icons/ai';
import { BiStar, BiTrash } from 'react-icons/bi';
import { BsPhone } from 'react-icons/bs';
import { HiOutlineMail } from 'react-icons/hi';
import { MdSettingsBackupRestore } from 'react-icons/md';

const TableRows = ({
  profile,
  cvSelected,
  setCvSelected,
  setTableItems,
  favPage,
  search,
  handleToggleFav,
  setVisited,
}: {
  cvSelected: boolean;
  setCvSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setTableItems: React.Dispatch<React.SetStateAction<scrappingInfos[]>>;
  profile: scrappingInfos;
  search?: mainParams;
  favPage: boolean;
  setVisited: React.Dispatch<React.SetStateAction<visited>>;
  handleToggleFav: (profile: scrappingInfos) => Promise<void>;
}) => {
  const [currentCvSelected, setCurrentCvSelected] = useState<boolean>(false);
  const {
    actions: { setScrapeMail },
    services: { scrappingEmail, updateFav, cvContent },
  } = useAppContext();

  const hightLightWords: string[] = useMemo(() => {
    if (!search) {
      return [];
    }
    const { key } = search;

    return (Array.isArray(key) ? key : [key]) as string[];
  }, [search]);

  const handleCopyText = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, canCopy: boolean) => {
      e.preventDefault();
      e.stopPropagation();

      if (!canCopy) {
        return;
      }
      const target = e?.currentTarget?.children.item(0) as HTMLSpanElement;
      const email = target.textContent as string;
      copy(email);
      target.textContent = 'Copier';
      setTimeout(() => {
        target.innerText = email;
      }, 750);
    },
    [],
  );

  const handleCaptureMail = useCallback(
    async (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      profile: scrappingReseauProps,
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const el = e.currentTarget;
      const divWrapper = startMailAnimation(el);

      const [firstName, lastName] = profile.fullName.split(' ');
      const [err, mail] = (await scrappingEmail({
        firstName,
        lastName,
        company: profile.currentCompany as string,
        ...(profile?.link ? { link: profile.link } : {}),
      })) as [boolean | Error, Record<string, unknown> | any[]];
      console.log(mail);

      if (err || !mail?.length) {
        if ((mail as Record<string, unknown>)?.plan) {
          InfoToast({
            text: (mail as Record<string, unknown>).plan as string,
          });
          divWrapper.className = 'hidden';
          Array.from(el.children).forEach((child) =>
            child.classList.remove('opacity-0'),
          );
          el.className =
            'w-14 lg:w-[4.4rem] xl:w-20 relative z-10 overflow-hidden h-5 lg:h-6 xl:h-[1.65rem] max-w-screen-md transition-all duration-250 ease-in-out mt-1 opacity-75 border-1 border-foreground/40 bg-asset/20 text-foreground/90 rounded-md flex items-center';
          return;
        }
        svgMailFailed(divWrapper, 'Email Introuvable', handleCopyText, false);
        return;
      }
      if (favPage) {
        delete profile.isFavoris;
        const { err } = await updateFav({
          ...profile,
          id: profile.id as string,
          email: mail?.length ? JSON.stringify(mail) : false,
        });
        if (err) {
          throw new ClientException();
        }
      }
      await svgMailSuccess(divWrapper);
      setTableItems((prev) =>
        prev.map((o) => {
          if (!favPage) {
            if (isScrappingReseauProps(o) && o.link === profile.link) {
              if (Array.isArray(mail) && mail.length) {
                return { ...o, email: mail };
              }
            }
          }
          return o;
        }),
      );
      setScrapeMail({
        link: profile.link,
        value: mail?.length ? JSON.stringify(mail) : undefined,
      });
      return;
    },
    [
      favPage,
      handleCopyText,
      scrappingEmail,
      setScrapeMail,
      setTableItems,
      updateFav,
    ],
  );

  const handleLinkClick = useCallback(() => {
    if (favPage) {
      return;
    }
    setVisited((e) => ({
      ...e,
      profile: e.profile + 1,
    }));
  }, [favPage, setVisited]);

  const handleCvClick = useCallback(async () => {
    if (cvSelected) {
      return;
    }
    if (!favPage) {
      setVisited((e) => ({
        ...e,
        cv: e.cv + 1,
      }));
    }

    try {
      setCurrentCvSelected(true);
      setCvSelected(true);
      const { err, res } = await cvContent((profile as scrappingCVProps).pdf);
      if (err || !res) {
        throw new ClientException();
      }
      setCurrentCvSelected(false);
      setCvSelected(false);

      const compressedPdfBytes = Uint8Array.from(atob(res as string), (c) =>
        c.charCodeAt(0),
      );
      const pdfBytes = pako.ungzip(compressedPdfBytes);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      throw new ClientException(500, 'Error fetching or displaying PDF');
    }
  }, [cvContent, cvSelected, favPage, profile, setCvSelected, setVisited]);

  const handleToggleClick = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      profile: scrappingInfos,
    ) => {
      e.preventDefault();
      e.stopPropagation();
      handleToggleFav({
        ...profile,
        email:
          'email' in profile
            ? (JSON.stringify(profile.email) as any)
            : undefined,
      });
    },
    [handleToggleFav],
  );

  if ('link' in profile) {
    const [currentProfile, hasPhone] = useMemo(() => {
      const profileData = profile as scrappingReseauProps;

      try {
        const convertedEmails = JSON.parse(profileData.email as any) as
          | emailProps[]
          | string[];

        profileData.email = convertedEmails?.map((v) =>
          typeof v === 'string' ? { email: v } : v,
        );
      } catch (error) {
        if (typeof profileData.email === 'string') {
          profileData.email = [{ email: profileData.email }];
        }
      } finally {
        const hasPhone = profileData.email?.some((v) => !!v.phone);
        return [profileData, hasPhone];
      }
    }, [profile]);

    return (
      <>
        <Link
          onAuxClick={handleLinkClick}
          onClick={handleLinkClick}
          target="_blank"
          href={currentProfile.link as string}
          className="w-full md:h-11 lg:h-[3.4rem] xl:h-[3.6rem] relative hover:bg-successBg/30 flex flex-row space-x-4 border-1 border-asset/20 text-foreground/75 items-center bg-content px-1 py-0 lg:px-1.5 lg:py-0.5 xl:px-2 xl:py-1 -ml-2 rounded-md"
        >
          <div className="md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 relative">
            <Image
              className="rounded-md"
              src={currentProfile?.img}
              fill
              sizes="100%"
              loading="lazy"
              alt="candidate profile"
              quality={80}
            />
          </div>

          <div className="md:w-[20%] lg:w-[19%] overflow-hidden pr-1 mb-0.5">
            <span className="text-ellipsis -mb-0.5 text-foreground/90 text-p2 overflow-hidden line-clamp-1">
              {currentProfile.fullName}
            </span>
            {currentProfile.email === undefined ? (
              currentProfile.fullName &&
              currentProfile.currentCompany && (
                <button
                  onClickCapture={(e) => handleCaptureMail(e, currentProfile)}
                  className="min-w-10 w-fit relative z-10 overflow-hidden h-[1.2rem] lg:h-6 xl:h-[1.65rem] max-w-screen-md transition-all duration-250 ease-in-out mt-1 opacity-75 border-1 border-foreground/40 bg-asset/20 text-foreground/90 rounded-md flex items-center"
                >
                  <span className="transition-opacity mx-1 duration-250 text-i1">
                    Contacter
                  </span>
                </button>
              )
            ) : (
              <div className="relative">
                {currentProfile?.email?.length > 1 ||
                currentProfile?.email[0]?.phone ? (
                  <Popover
                    classNames={{ content: 'p-0' }}
                    placement="bottom-start"
                  >
                    <PopoverTrigger>
                      <div
                        onClickCapture={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className={cn(
                          'w-fit min-w-0 max-w-full overflow-hidden relative transition-all hover:opacity-100 z-10 mt-1 lg:h-6  xl:h-[1.65rem] rounded-md flex items-center px-2 border-[1px] !text-i1 border-errorTxt/60 bg-errorBg/40 text-foreground/80 opacity-80',
                          {
                            'border-secondary/60 bg-successBg/40':
                              !!currentProfile.email,
                          },
                        )}
                      >
                        <span className="line-clamp-1 max-w-full text-ellipsis overflow-hidden break-words whitespace-nowrap">
                          {currentProfile.email[0].email} +
                          {currentProfile?.email?.length || 1}
                        </span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className={cn(
                        'px-3 py-2.5 min-w-0 items-start grid grid-cols-3 gap-x-8 bg-background border-1.5 border-special/60 shadow-md shadow-asset/20 rounded-lg',
                        { 'grid-cols-2': !hasPhone },
                      )}
                    >
                      <div className="flex gap-x-3 col-span-2 flex-row items-start">
                        <HiOutlineMail className="w-6 h-6 text-foreground/90" />
                        <div className="flex flex-col space-y-1.5">
                          {currentProfile?.email.map(
                            (v, i) =>
                              !!v.email && (
                                <div
                                  className="flex items-center flex-row"
                                  key={i}
                                >
                                  <div
                                    className={cn(
                                      'w-1.5 h-1.5 rounded-full bg-red-700 mr-1.5',
                                      { 'bg-orange-400': v.color === 2 },
                                      { 'bg-validTxt': v.color === 3 },
                                    )}
                                  ></div>
                                  <button
                                    onClickCapture={(e) =>
                                      handleCopyText(e, true)
                                    }
                                    className="w-fit min-w-0 overflow-hidden relative transition-all opacity-100  z-10 lg:h-[1.65rem] xl:h-[1.7rem] rounded-md flex items-center px-2 border-[1px] !text-i1 border-special/60 hover:bg-success/20 bg-success/10 text-foreground/80"
                                  >
                                    <span className="line-clamp-1 text-ellipsis overflow-hidden break-words whitespace-nowrap">
                                      {v.email}
                                    </span>
                                  </button>
                                </div>
                              ),
                          )}
                        </div>
                      </div>
                      {hasPhone && (
                        <div className="flex gap-x-3 flex-row items-start">
                          <BsPhone className="w-5 h-5 stroke-1 mt-1 text-foreground/60" />
                          <div className="flex flex-col space-y-1.5">
                            {currentProfile?.email.map(
                              (v, i) =>
                                !!v.phone &&
                                (Array.isArray(v.phone) ? (
                                  v.phone.map((phone, id) => (
                                    <button
                                      key={id}
                                      onClickCapture={(e) =>
                                        handleCopyText(e, true)
                                      }
                                      className="w-fit min-w-0 overflow-hidden relative transition-all opacity-100  z-10 lg:h-[1.65rem] xl:h-[1.7rem] rounded-md flex items-center px-2 border-[1px] !text-i1 border-special/60 hover:bg-success/20 bg-success/10 text-foreground/80"
                                    >
                                      <span className="line-clamp-1 text-ellipsis overflow-hidden break-words whitespace-nowrap">
                                        {phone.match(/.{1,2}/g)?.join(' ')}
                                      </span>
                                    </button>
                                  ))
                                ) : (
                                  <button
                                    key={i}
                                    onClickCapture={(e) =>
                                      handleCopyText(e, true)
                                    }
                                    className="w-fit min-w-0 overflow-hidden relative transition-all opacity-100  z-10 lg:h-[1.65rem] xl:h-[1.7rem] rounded-md flex items-center px-2 border-[1px] !text-i1 border-special/60 hover:bg-success/20 bg-success/10 text-foreground/80"
                                  >
                                    <span className="line-clamp-1 text-ellipsis overflow-hidden break-words whitespace-nowrap">
                                      {v.phone.match(/.{1,2}/g)?.join(' ')}
                                    </span>
                                  </button>
                                )),
                            )}
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button
                    onClickCapture={(e) =>
                      handleCopyText(
                        e,
                        !!(currentProfile?.email || [])[0]?.email,
                      )
                    }
                    className={cn(
                      'w-fit min-w-0 max-w-full overflow-hidden relative transition-all hover:scale-[1.03] hover:translate-x-1 z-10 mt-1 lg:h-6  xl:h-[1.65rem] rounded-md flex items-center px-2 border-[1px] !text-i1 border-errorTxt/60 bg-errorBg/40 text-foreground/80',
                      {
                        'border-secondary/60 bg-successBg/40':
                          !!currentProfile.email[0].email,
                      },
                    )}
                  >
                    <span className="line-clamp-1 max-w-full text-ellipsis overflow-hidden break-words whitespace-nowrap">
                      {currentProfile.email[0].email || 'Email Introuvable'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            className={cn(
              'w-[30%] pr-1 text-p3 space-y-1 lg:space-y-0.5 xl:space-y-0',
              { 'w-1/4': !favPage },
            )}
          >
            <span className="text-ellipsis text-foreground/90 line-clamp-1">
              {currentProfile.currentJob}
            </span>
            <span className="text-foreground/75 line-clamp-1 text-ellipsis">
              {currentProfile?.diplome
                ? currentProfile.diplome
                : currentProfile?.currentCompany}
            </span>
          </div>

          <p className="flex-1 overflow-hidden text-ellipsis !text-p3 break-words text-slate-500 line-clamp-2">
            <Highlighter
              highlightClassName="text-foreground/70 bg-transparent font-semibold !text-p2 mx-0.5"
              searchWords={hightLightWords}
              autoEscape={true}
              textToHighlight={currentProfile.resume}
            />
          </p>

          <div
            onClickCapture={(e) => handleToggleClick(e, currentProfile)}
            className="md:w-9 lg:w-10 xl:w-12 relative z-10"
          >
            {favPage ? (
              currentProfile.isFavoris ? (
                <BiTrash className="w-full h-full p-2 xl:p-2.5 fill-secondary/80 hover:cursor-pointer transition-transform duration-250 hover:fill-errorTxt hover:scale-110" />
              ) : (
                <MdSettingsBackupRestore className="w-full h-full p-2 xl:p-2.5 fill-secondary/80 hover:cursor-pointer transition-transform duration-250 hover:fill-validTxt hover:scale-110" />
              )
            ) : currentProfile.favFolderId ? (
              <AiFillStar className="w-full h-full p-2 xl:p-2.5 fill-secondary/80" />
            ) : (
              <BiStar className="w-full h-full p-2 xl:p-2.5 fill-secondary/80" />
            )}
          </div>
        </Link>
      </>
    );
  }
  const currentProfile = profile as scrappingCVProps;
  return (
    <>
      <div
        onClick={handleCvClick}
        onAuxClick={handleCvClick}
        className={cn(
          'w-full hover:cursor-pointer md:h-11 lg:h-[3.4rem] xl:h-[3.6rem] relative hover:bg-successBg/30 flex flex-row space-x-4 border-1 border-asset/20 text-foreground/75 items-center bg-content px-1 py-0 lg:px-1.5 lg:py-0.5 xl:px-2 xl:py-1 -ml-2 rounded-md',
          { 'opacity-60': cvSelected },
          { 'opacity-100': currentCvSelected },
        )}
      >
        <div className="md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 relative">
          <Image
            className="rounded-md"
            src={currentProfile?.img}
            fill
            sizes="100%"
            loading="lazy"
            alt="candidate profile"
            quality={80}
          />
          {favPage && (
            <div className="w-6 h-6 absolute bottom-0 right-0 rounded bg-content/60">
              <AiOutlineFilePdf className="w-full h-full text-foreground/90 scale-105" />
            </div>
          )}
        </div>

        <div className="md:w-[20%] lg:w-[19%] overflow-hidden pr-1 mb-0.5">
          <span className="text-ellipsis text-foreground/90 text-p2 overflow-hidden line-clamp-1">
            {currentProfile.fullName}
          </span>
        </div>

        <div
          className={cn(
            'w-[30%] pr-1 text-p3 space-y-1 lg:space-y-0.5 xl:space-y-0',
            { 'w-1/4': !favPage },
          )}
        >
          <span className="text-ellipsis text-foreground/90 line-clamp-1">
            {currentProfile.currentJob}
          </span>
          <span className="text-foreground/75 line-clamp-1 text-ellipsis">
            {currentProfile?.currentCompany}
          </span>
        </div>

        <p className="flex-1 overflow-hidden text-ellipsis !text-p3 break-words text-slate-500 line-clamp-2">
          {currentProfile.resume}
        </p>

        <div
          onClickCapture={(e) => handleToggleClick(e, currentProfile)}
          className="md:w-9 lg:w-10 xl:w-12 relative z-10"
        >
          {favPage ? (
            currentProfile.isFavoris ? (
              <BiTrash className="w-full h-full p-2 xl:p-2.5 fill-secondary/80 hover:cursor-pointer transition-transform duration-250 hover:fill-errorTxt hover:scale-110" />
            ) : (
              <MdSettingsBackupRestore className="w-full h-full p-2 xl:p-2.5 fill-secondary/80 hover:cursor-pointer transition-transform duration-250 hover:fill-validTxt hover:scale-110" />
            )
          ) : currentProfile.favFolderId ? (
            <AiFillStar className="w-full h-full p-2 xl:p-2.5 fill-secondary/80" />
          ) : (
            <BiStar className="w-full h-full p-2 xl:p-2.5 fill-secondary/80" />
          )}
        </div>
      </div>
    </>
  );
};

export default TableRows;

function isScrappingReseauProps(
  item: scrappingInfos,
): item is scrappingReseauProps {
  return 'link' in item;
}
