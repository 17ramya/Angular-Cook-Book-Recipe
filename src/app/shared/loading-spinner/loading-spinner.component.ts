import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `<div class="rb-spinner" role="status">
    <span class="rb-sr-only">Loading&hellip;</span>
    <span class="rb-spinner__ring"></span>
  </div>`,
  styleUrls: ['./loading-spinner.component.css'],
})
export class LoadingSpinnerComponent {}
