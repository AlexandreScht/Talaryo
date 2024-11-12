'use client';
import Image from 'next/image';
import Link from 'next/link';
import { IoMdOpen } from 'react-icons/io';

const LastFavSave = ({
  link,
  img,
  fullName,
  currentJob = 'Non précisé',
}: {
  link: string;
  img: string;
  fullName: string;
  currentJob?: string;
}) => {
  return (
    <Link
      href={link}
      target="_blank"
      className="w-full bg-content border-1 border-asset/25 transition-transform hover:scale-[1.025] rounded-lg md:px-1 p-1.5 xl:p-2 flex flex-row items-center justify-between"
    >
      <div className="w-full relative">
        <div className="flex h-full flex-row items-center">
          <div className="bg-slate-500 md:w-7 md:h-7 lg:w-10 lg:h-10 xl:w-12 xl:h-12 relative rounded-lg">
            <Image
              className="rounded lg:rounded-md"
              src={img}
              fill
              loading="lazy"
              alt="Logo of the website"
              quality={80}
            />
          </div>
          <div className="h-fit flex-1 lg:pr-12 xl:pr-14 ml-3 overflow-hidden flex flex-col justify-center group:text-ellipsis">
            <h3 className="line-clamp-1 flex-wrap text-foreground/90 text-p3">
              {fullName}
            </h3>
            <span className="line-clamp-1 text-p4 text-asset">
              {currentJob}
            </span>
          </div>
        </div>
        <div className="md:w-8 md:h-8 absolute right-0 top-1/2 -translate-y-1/2 lg:w-10 lg:h-10 xl:w-11 xl:h-11 opacity-60 ml-1 bg-background rounded-lg flex justify-center items-center">
          <IoMdOpen className="text-foreground w-3/6 h-3/6" />
        </div>
      </div>
    </Link>
  );
};

export default LastFavSave;
