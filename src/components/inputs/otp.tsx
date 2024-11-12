'use client';
import '@/styles/inputs/numbers.css';
import cn from '@/utils/cn';
import { OtpFieldType } from 'component-types';
import { useCallback } from 'react';
import OtpInput, { type OTPInputProps } from 'react-otp-input';
export default function OtpField({
  otp,
  setOtp,
  digitNumber = 4,
  classNames,
  ...other
}: OtpFieldType<Partial<OTPInputProps>>) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && otp.length > 0) {
        setOtp(otp.slice(0, -1));
      }
    },
    [otp, setOtp],
  );

  const renderInput = useCallback(
    (
      inputProps: React.InputHTMLAttributes<HTMLInputElement>,
      index: number,
    ) => {
      const isCurrent = otp.length === index || (!otp.length && index === 0);

      return (
        <input
          {...inputProps}
          key={index}
          onKeyDown={handleKeyDown}
          className={cn(
            '!w-8 lg:!w-14 aspect-square outline !outline-2 outline-foreground/25 bg-asset/30 rounded text-center text-xl border-none',
            {
              'outline-secondary bg-secondary/5': isCurrent,
            },
            classNames?.input,
          )}
        />
      );
    },
    [classNames?.input, handleKeyDown, otp.length],
  );
  return (
    <OtpInput
      value={otp}
      onChange={setOtp}
      numInputs={digitNumber}
      renderInput={renderInput}
      containerStyle={cn('w-full flex justify-evenly', classNames?.wrapper)}
      {...other}
      inputType="number"
    />
  );
}
