import { inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Injectable({
   providedIn: 'root'
})
export class SvgIconService {
   private readonly iconRegistry = inject(MatIconRegistry);
   private readonly domSanitizer = inject(DomSanitizer);

   constructor() {
      this.registerIcons();
   }

   private registerIcons() {
      const icons = ['logo'];

      icons.forEach(icon => {
         this.iconRegistry.addSvgIcon(
            icon,
            this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`)
         );

      });
   }
}
