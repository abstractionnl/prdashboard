export interface Filters {
    repositories: string[];
    creators: string[];
    showDrafts: boolean;
}

export function encodeFilter(filter: Filters): string {
    var searchParams = [];

    if (filter.creators && filter.creators.length > 0) {
      searchParams.push('creators=' + filter.creators.map(encodeURIComponent).join(';'));
    }

    if (filter.repositories && filter.repositories.length > 0) {
      searchParams.push('repositories=' + filter.repositories.map(encodeURIComponent).join(';'));
    }

    if (filter.showDrafts) {
      searchParams.push('showDrafts=1')
    }

    return searchParams.join('&');
}

export function decodeFilter(searchParams: string): Filters {
    var s = new URLSearchParams(searchParams);

    return {
        creators: s.has('creators') ? s.get('creators').split(';') : [],
        repositories: s.has('repositories') ? s.get('repositories').split(';') : [],
        showDrafts: s.has('showDrafts') ? s.get('showDrafts') == '1' : false
    }
}