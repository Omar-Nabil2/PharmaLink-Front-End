import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaInstallService {
  private deferredPrompt: any = null;
  private promptSaved = new BehaviorSubject<boolean>(false);
  
  public promptSaved$ = this.promptSaved.asObservable();

  constructor() {
    this.initPwaInstall();
  }

  private initPwaInstall() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        this.deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        this.promptSaved.next(true);
      });

      window.addEventListener('appinstalled', () => {
        // Log install to analytics
        console.log('PharmaLink PWA was installed');
        this.deferredPrompt = null;
        this.promptSaved.next(false);
      });
    }
  }

  public async installPwa(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    this.deferredPrompt = null;
    this.promptSaved.next(false);

    return outcome === 'accepted';
  }
}
