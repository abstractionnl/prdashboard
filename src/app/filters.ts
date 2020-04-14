import { stringify } from 'querystring';
import * as short from "short-uuid";

let translator = short();

export interface Filters {
    repositories: string[];
    creators: string[];
    showDrafts: boolean;
}

export function encodeFilter(filter: Filters): string {
    var searchParams = [];

    if (filter.creators && filter.creators.length > 0) {
      searchParams.push('creators=' + filter.creators.map(encodeGuid).join(';'));
    }

    if (filter.repositories && filter.repositories.length > 0) {
      searchParams.push('repositories=' + filter.repositories.join(';'));
    }

    if (filter.showDrafts) {
      searchParams.push('showDrafts=1')
    }

    return searchParams.join('&');
}

export function encodeGuid(input: string): string {
  return translator.fromUUID(input);
}

export function decodeGuid(input: string): string {
  if (input.length >= 32) // Fallback for old guids saved in bookmarks
    return input;

  return translator.toUUID(input);
}

export function decodeFilter(searchParams: string): Filters {
    var s = new URLSearchParams(searchParams);

    return {
        creators: s.has('creators') ? s.get('creators').split(';').map(decodeGuid) : [],
        repositories: s.has('repositories') ? s.get('repositories').split(';') : [],
        showDrafts: s.has('showDrafts') ? s.get('showDrafts') == '1' : false
    }
}