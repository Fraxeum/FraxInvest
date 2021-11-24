import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AzuzaHelpPage } from './azuza-help.page';

describe('AzuzaHelpPage', () => {
  let component: AzuzaHelpPage;
  let fixture: ComponentFixture<AzuzaHelpPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AzuzaHelpPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AzuzaHelpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
