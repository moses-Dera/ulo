import { AppError } from "@/shared/errors";

export class InvalidFileSignatureError extends AppError {
  constructor(message: string = "Invalid file signature: file contents do not match genuine image magic bytes (TC-004)") {
    super(message, 400, "INVALID_FILE_SIGNATURE");
  }
}

export class FileTooLargeError extends AppError {
  constructor(message: string = "File exceeds maximum permitted size of 5 MB") {
    super(message, 413, "FILE_TOO_LARGE");
  }
}

export class ImageLimitExceededError extends AppError {
  constructor(message: string = "Hostel cannot exceed 10 total images") {
    super(message, 422, "IMAGE_LIMIT_EXCEEDED");
  }
}
