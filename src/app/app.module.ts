import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SolutionRendererComponent } from './solution-renderer/solution-renderer.component';

@NgModule({
  declarations: [
    AppComponent,
    SolutionRendererComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
