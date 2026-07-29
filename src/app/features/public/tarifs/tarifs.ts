import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tarifs',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tarifs.html',
})
export class TarifsComponent {
  readonly plans = [
    {
      name: 'Starter',
      price: 'Gratuit',
      period: '',
      desc: 'Pour démarrer et tester NexaStock sans engagement.',
      cta: 'Démarrer gratuitement',
      ctaLink: '/inscription',
      featured: false,
      features: [
        '1 site',
        '3 utilisateurs',
        '100 produits',
        'Mouvements de stock',
        'Alertes basiques',
        'Historique 30 jours',
      ],
    },
    {
      name: 'Business',
      price: '9 900',
      period: '/ mois',
      desc: 'Pour les entreprises en croissance avec plusieurs sites.',
      cta: 'Essayer 14 jours gratuits',
      ctaLink: '/inscription',
      featured: true,
      features: [
        '5 sites',
        '15 utilisateurs',
        'Produits illimités',
        'Commandes fournisseurs',
        'Alertes avancées',
        'Rapports & exports',
        'Transferts inter-sites',
        'Historique illimité',
      ],
    },
    {
      name: 'Entreprise',
      price: 'Sur mesure',
      period: '',
      desc: 'Pour les grands comptes et réseaux multisites.',
      cta: 'Nous contacter',
      ctaLink: '/contact',
      featured: false,
      features: [
        'Sites illimités',
        'Utilisateurs illimités',
        'Intégrations personnalisées',
        'SLA dédié',
        'Accompagnement à l\'onboarding',
        'Accès API',
        'Tableau de bord personnalisé',
        'Support prioritaire 24/7',
      ],
    },
  ];

  readonly faq = [
    { q: 'Puis-je changer de plan à tout moment ?', r: 'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement est effectif immédiatement.' },
    { q: 'La période d\'essai nécessite-t-elle une carte bancaire ?', r: 'Non. Vous pouvez essayer le plan Business 14 jours sans carte bancaire ni engagement.' },
    { q: 'Mes données sont-elles sécurisées ?', r: 'Vos données sont hébergées en Europe sur des serveurs sécurisés, avec sauvegardes quotidiennes et chiffrement en transit.' },
    { q: 'Puis-je importer mes données existantes ?', r: 'Oui, notre équipe peut vous accompagner pour l\'import initial de vos produits et stocks via fichier Excel ou CSV.' },
  ];
}
