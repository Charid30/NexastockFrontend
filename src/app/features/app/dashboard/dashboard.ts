import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../../core/services/reports.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private reportsService = inject(ReportsService);

  loading = signal(true);
  stats = signal<any>(null);

  ngOnInit() {
    this.reportsService.getDashboard().subscribe({
      next: (res) => { this.stats.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
