import { searchRepo } from "./search.repo";
import { SearchMapper } from "./search.mapper";
import { logSearchExecuted } from "./search.events";
import { SearchHostelsInput, searchHostelsSchema } from "./search.schema";

export class SearchService {
  async search(rawFilters: SearchHostelsInput) {
    const filters = searchHostelsSchema.parse(rawFilters);
    const { items, total } = await searchRepo.searchPublishedHostels(filters);
    logSearchExecuted(filters as Record<string, unknown>, items.length);

    return SearchMapper.toPaginatedResponse(items, total, filters.page, filters.limit);
  }
}

export const searchService = new SearchService();
