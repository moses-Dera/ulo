import { SearchResponseDto, HostelSearchResultDto } from "./search.dto";

export class SearchMapper {
  static toPaginatedResponse(
    items: HostelSearchResultDto[],
    total: number,
    page: number,
    limit: number
  ): SearchResponseDto {
    return {
      results: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
