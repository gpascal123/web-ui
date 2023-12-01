import { ActiveSpinnerComponent } from './loading-spinner/loading-spinner-active.component';
import { PassStrenghtComponent } from './password/pass-strenght/pass-strenght.component';
import { ButtonTruncateTextComponent } from './table/button-truncate-text.component';
import { HexconvertorComponent } from './utils/hexconvertor/hexconvertor.component';
import { TimeoutDialogComponent } from './dialog/timeout/timeout-dialog.component';
import { PassMatchComponent } from './password/pass-match/pass-match.component';
import { FixedAlertComponent } from './alert/fixed-alert/fixed-alert.component';
import { CheatsheetComponent } from './alert/cheatsheet/cheatsheet.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { CommonModule } from '@angular/common';
import { DynamicFormModule } from './dynamic-form-builder/dynamicform.module';
import { FilterTextboxModule } from './filter-textbox/filter-textbox.module';
import { SwitchThemeModule } from './switch-theme/switch-theme.module';
import { TimeoutComponent } from './alert/timeout/timeout.component';
import { HorizontalNavModule } from './navigation/navigation.module';
import { InputModule } from './input/input.module';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { LottiesModule } from './lottie/lottie.module';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageTitleModule } from './page-headers/page-title.module';
import { PaginationModule } from './pagination/pagination.module';
import { DynamicFormModule } from './dynamic-form-builder/dynamicform.module';
import { GridModule } from './grid-containers/grid.module';
import { TableModule } from './table/table-actions.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AlertComponent } from './alert/alert.component';
import { ButtonsModule } from './buttons/buttons.module';
import { LottiesModule } from './lottie/lottie.module';
import { GraphsModule } from './graphs/graphs.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { InputModule } from './input/input.module';
import { FormsModule } from '@angular/forms';
import { CoreFormsModule } from './forms.module';
import { AlertNavModule } from './alert/alert.module';

@NgModule({
  declarations: [
    HashtypeDetectorComponent,
    LoadingSpinnerComponent,
    TimeoutDialogComponent,
    ActiveSpinnerComponent,
    HexconvertorComponent,
    PassStrenghtComponent,
    CheatsheetComponent,
    FixedAlertComponent,
    PassMatchComponent,
    TimeoutComponent,
    AlertComponent
  ],
  imports: [
    FilterTextboxModule,
    HorizontalNavModule,
    DynamicFormModule,
    SwitchThemeModule,
    ColorPickerModule,
    PaginationModule,
    CoreFormsModule,
    PageTitleModule,
    FlexLayoutModule,
    AlertNavModule,
    ButtonsModule,
    LottiesModule,
    GraphsModule,
    TableModule,
    InputModule,
    GridModule,
    NgbModule
  ],
  exports: [
    HashtypeDetectorComponent,
    LoadingSpinnerComponent,
    TimeoutDialogComponent,
    ActiveSpinnerComponent,
    HexconvertorComponent,
    PassStrenghtComponent,
    FilterTextboxModule,
    HorizontalNavModule,
    CheatsheetComponent,
    FixedAlertComponent,
    PassMatchComponent,
    SwitchThemeModule,
    DynamicFormModule,
    ColorPickerModule,
    PaginationModule,
    TimeoutComponent,
    PageTitleModule,
    AlertComponent,
    AlertNavModule,
    ButtonsModule,
    LottiesModule,
    GraphsModule,
    CommonModule,
    InputModule,
    TableModule,
    GridModule
  ]
})
export class ComponentsModule {}
