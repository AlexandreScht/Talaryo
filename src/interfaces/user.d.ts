export type userList = {
  userId: number;
  refreshToken: string;
  socketId: string;
  secret_key: string;
};

interface eventList {
  userId: number;
  eventName: string;
  value?: any;
  text?: string;
  date: string;
}

interface eventData {
  value?: any;
  text?: string;
  date: string;
}

export type eventsMap = Map<string, eventList>;
