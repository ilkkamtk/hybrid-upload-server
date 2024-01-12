type MessageResponse = {
  message: string;
};

type ErrorResponse = MessageResponse & {
  stack?: string;
};

type UploadResponse = MessageResponse & {
  data: {
    filename: string;
    media_type: string;
    filesize: number;
  };
};

export type {MessageResponse, ErrorResponse, UploadResponse};
