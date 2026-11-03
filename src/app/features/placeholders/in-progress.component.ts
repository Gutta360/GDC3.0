import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-in-progress',
  imports: [RouterLink],
  template: `<section class="placeholder-page"><div class="placeholder-card"><span class="progress-icon">◌</span><span class="eyebrow">{{ title }}</span><h1>Coming in a future phase</h1><p>This module is reserved while the offline patient foundation is being validated.</p><a class="secondary-button" routerLink="/home">Return to dashboard</a></div></section>`
})
export class InProgressComponent { readonly title = inject(ActivatedRoute).snapshot.data['title'] as string; }
