export type userList = {
  userId: number;
  refreshToken: string;
  socketId: string;
  secret_key: string;
};

interface eventList {
  userId: number;
  eventName: string;
  value: {
    res: any;
  };
  eventId: number;
}

export type eventsMap = Map<string, eventList>;
