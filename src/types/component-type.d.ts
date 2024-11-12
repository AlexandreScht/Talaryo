declare module 'component-types' {
  //* OtpField
  interface CustomOtpFieldType {
    otp: string;
    setOtp: React.Dispatch<React.SetStateAction<string>>;
    digitNumber?: number;
    classNames?: {
      input?: string | Record<string, boolean>;
      wrapper?: string | Record<string, boolean>;
    };
  }
  type OtpFieldType<T> = CustomOtpFieldType & T;
}
