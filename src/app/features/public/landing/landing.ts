import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
})
export class LandingComponent implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.dashboardUrl]);
    }
  }
  readonly features = [
    { icon: '▦', title: 'Multi-sites', desc: 'Gérez plusieurs boutiques, entrepôts et annexes depuis un seul espace.' },
    { icon: '⊞', title: 'Rôles & accès', desc: 'Attribuez des rôles précis à chaque employé selon son poste.' },
    { icon: '↕', title: 'Mouvements de stock', desc: 'Entrées, sorties, transferts et ajustements en temps réel.' },
    { icon: '◎', title: 'Alertes automatiques', desc: 'Recevez des alertes dès qu\'un produit atteint le seuil critique.' },
    { icon: '▤', title: 'Commandes fournisseurs', desc: 'Créez et suivez vos bons de commande jusqu\'à la réception.' },
    { icon: '≋', title: 'Rapports & analyse', desc: 'Valorisation du stock, tableaux de bord, historique des mouvements.' },
  ];

  readonly useCases = [
    { label: 'Commerce de détail', desc: 'Supermarchés, boutiques, épiceries' },
    { label: 'Distribution', desc: 'Grossistes, distributeurs, importateurs' },
    { label: 'Industrie', desc: 'Ateliers, usines, production' },
    { label: 'Usage interne', desc: 'Stocks de fournitures, équipements, matériels' },
  ];
}
