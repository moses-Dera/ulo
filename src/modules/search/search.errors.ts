import { AppError } from "@/shared/errors";

export class SearchQueryError extends AppError {
  constructor(message: string = "Invalid search parameters provided") {
    super(message, 400, "SEARCH_QUERY_ERROR");
  }
}
