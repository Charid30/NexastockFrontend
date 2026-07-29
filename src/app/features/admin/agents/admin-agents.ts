import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminAgentsService } from '../../../core/services/admin-agents.service';

const NEXALAB_ROLES = [
  { value: 'nexalab_support',    label: 'Support Client' },
  { value: 'nexalab_commercial', label: 'Équipe Commerciale' },
  { value: 'nexalab_technique',  label: 'Équipe Technique' },
];

@Component({
  selector: 'app-admin-agents',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-agents.html',
})
export class AdminAgentsComponent implements OnInit {
  private readonly svc = inject(AdminAgentsService);

  readonly roles   = NEXALAB_ROLES;
  readonly agents  = signal<any[]>([]);
  readonly total   = signal(0);
  readonly loading = signal(false);
  readonly saving  = signal(false);
  readonly error   = signal('');

  search    = '';
  roleFilter = '';

  showModal  = signal(false);
  editTarget = signal<any>(null);

  form = { first_name: '', last_name: '', phone: '', email: '', password: '', role: '' };

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll({ search: this.search, role: this.roleFilter }).subscribe({
      next: (r) => { this.agents.set(r.data.data); this.total.set(r.data.total); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editTarget.set(null);
    this.form = { first_name: '', last_name: '', phone: '', email: '', password: '', role: '' };
    this.error.set('');
    this.showModal.set(true);
  }

  openEdit(agent: any) {
    this.editTarget.set(agent);
    this.form = { first_name: agent.first_name, last_name: agent.last_name, phone: agent.phone, email: agent.email || '', password: '', role: agent.role };
    this.error.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  submit(f: NgForm) {
    if (f.invalid) return;
    this.saving.set(true);
    this.error.set('');
    const target = this.editTarget();
    const obs = target
      ? this.svc.update(target.id, this.form)
      : this.svc.create(this.form);

    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: (err) => { this.error.set(err.error?.message ?? 'Erreur'); this.saving.set(false); },
    });
  }

  toggle(agent: any) {
    this.svc.toggle(agent.id).subscribe({ next: () => this.load() });
  }

  delete(agent: any) {
    if (!confirm(`Supprimer ${agent.first_name} ${agent.last_name} ?`)) return;
    this.svc.delete(agent.id).subscribe({ next: () => this.load() });
  }

  roleLabel(name: string) {
    return NEXALAB_ROLES.find(r => r.value === name)?.label ?? name;
  }
}
