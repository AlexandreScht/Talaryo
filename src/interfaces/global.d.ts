// types/global.d.ts
interface Window {
  gtag: Gtag.Gtag;
}
type MakeKeyRequired<T, K extends keyof T> = {
  [P in K]-?: T[P];
} & {
  [P in Exclude<keyof T, K>]?: T[P];
};
declare namespace Gtag {
  type Command = 'config' | 'event';

  interface Gtag {
    (command: 'config', targetId: string, config?: Config): void;
    (command: 'event', eventName: EventNames, eventParams?: EventParams): void;
  }

  interface Config {
    page_path?: string;
    send_page_view?: boolean;
    [key: string]: unknown;
  }

  type EventNames =
    | 'add_payment_info'
    | 'add_to_cart'
    | 'add_to_wishlist'
    | 'begin_checkout'
    | 'checkout_progress'
    | 'exception'
    | 'generate_lead'
    | 'login'
    | 'page_view'
    | 'purchase'
    | 'refund'
    | 'remove_from_cart'
    | 'screen_view'
    | 'search'
    | 'select_content'
    | 'set_checkout_option'
    | 'share'
    | 'sign_up'
    | 'timing_complete'
    | 'view_cart'
    | 'view_item'
    | 'view_item_list'
    | 'view_promotion'
    | 'view_search_results'
    | string;

  interface EventParams {
    [key: string]: unknown;
  }
}
