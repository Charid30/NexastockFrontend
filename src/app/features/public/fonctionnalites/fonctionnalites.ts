import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-fonctionnalites',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './fonctionnalites.html',
})
export class FonctionnalitesComponent {
  readonly sections = [
    {
      icon: '▦',
      title: 'Gestion multi-sites',
      desc: 'Centralisez tous vos points de vente, entrepôts et annexes dans un seul tableau de bord. Transférez du stock d\'un site à l\'autre en quelques clics.',
      details: ['Boutiques, entrepôts, annexes, siège', 'Vue globale ou par site', 'Transferts inter-sites traçables', 'Accès restreint par site selon le rôle'],
    },
    {
      icon: '↕',
      title: 'Mouvements de stock',
      desc: 'Suivez chaque entrée, sortie, transfert et ajustement en temps réel. L\'historique complet est conservé pour chaque produit.',
      details: ['Entrées de marchandises', 'Sorties et ventes', 'Transferts inter-sites', 'Ajustements d\'inventaire', 'Référence automatique horodatée'],
    },
    {
      icon: '▤',
      title: 'Commandes fournisseurs',
      desc: 'Créez des bons de commande, envoyez-les et suivez leur réception partielle ou totale. Chaque commande est liée à votre stock automatiquement.',
      details: ['Bon de commande numéroté', 'Statuts : Brouillon → Envoyée → Réceptionnée', 'Réception partielle ou totale', 'Mise à jour du stock à la réception'],
    },
    {
      icon: '◎',
      title: 'Alertes automatiques',
      desc: 'Définissez des seuils d\'alerte par produit et par site. Soyez notifié dès qu\'un niveau critique est atteint pour éviter les ruptures.',
      details: ['Seuil par produit et par site', 'Alerte rupture ou surstockage', 'Tableau de bord des alertes actives'],
    },
    {
      icon: '⊞',
      title: 'Équipes & rôles',
      desc: 'Invitez vos collaborateurs et attribuez-leur des rôles précis. Chaque employé voit uniquement ce dont il a besoin.',
      details: ['Rôles : Admin, Manager, Caissier, Magasinier', 'Accès restreint par site', 'Gestion centralisée des comptes', 'Journal d\'activité'],
    },
    {
      icon: '≋',
      title: 'Rapports & analyses',
      desc: 'Valorisez votre stock, analysez vos mouvements et prenez de meilleures décisions grâce aux rapports intégrés.',
      details: ['Valeur totale du stock', 'Historique des mouvements', 'Produits les plus mouvementés', 'Export des données'],
    },
  ];
}
