import { TestBed } from '@angular/core/testing';

import { HtmlHelpStringsService } from './html-help-strings.service';

describe('HtmlHelpStringsService', () => {
  let service: HtmlHelpStringsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlHelpStringsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
