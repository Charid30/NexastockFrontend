import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-a-propos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './a-propos.html',
})
export class AProposComponent {
  readonly values = [
    { icon: '◈', title: 'Simplicité', desc: 'Nous croyons que la gestion de stock ne doit pas être complexe. NexaStock est conçu pour être pris en main en quelques minutes, sans formation.' },
    { icon: '◉', title: 'Fiabilité', desc: 'Chaque donnée que vous entrez est sauvegardée et traçable. Vous pouvez faire confiance à NexaStock pour votre activité au quotidien.' },
    { icon: '◍', title: 'Adapté au marché africain', desc: 'Conçu par et pour les entreprises africaines, NexaStock prend en compte les réalités locales : multi-devises, multi-sites, équipes terrain.' },
  ];
}
