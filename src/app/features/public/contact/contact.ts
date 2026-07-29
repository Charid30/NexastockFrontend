import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
})
export class ContactComponent {
  form = { name: '', email: '', subject: '', message: '' };
  sent = signal(false);
  sending = signal(false);

  submit() {
    if (!this.form.name || !this.form.email || !this.form.message) return;
    this.sending.set(true);
    setTimeout(() => { this.sending.set(false); this.sent.set(true); }, 800);
  }
}
