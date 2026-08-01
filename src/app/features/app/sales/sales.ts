import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { SalesService } from '../../../core/services/sales.service';
import { ApiService }   from '../../../core/services/api.service';
import { AuthService }  from '../../../core/services/auth.service';

interface CartItem {
  product_id: string;
  name:       string;
  unit:       string;
  quantity:   number;
  unit_price: number;
  max_qty:    number;
}

@Component({
  selector:    'app-sales',
  standalone:  true,
  imports:     [FormsModule, DecimalPipe],
  templateUrl: './sales.html',
})
export class SalesComponent implements OnInit {
  private salesService = inject(SalesService);
  private auth         = inject(AuthService);
  private api          = inject(ApiService);

  sites          = signal<any[]>([]);
  stockItems     = signal<any[]>([]);
  cart           = signal<CartItem[]>([]);
  selectedSiteId = signal('');
  search         = signal('');
  paymentMethod  = signal('especes');
  note           = signal('');
  saving         = signal(false);
  success        = signal(false);
  errors         = signal<string[]>([]);
  loading        = signal(false);
  lastSale       = signal<any>(null);

  readonly PAYMENT_METHODS = [
    { value: 'especes',      label: 'Espèces' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'carte',        label: 'Carte bancaire' },
    { value: 'cheque',       label: 'Chèque' },
  ];

  readonly filteredStock = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.stockItems();
    return this.stockItems().filter(s =>
      s.product.name.toLowerCase().includes(q) ||
      (s.product.reference || '').toLowerCase().includes(q)
    );
  });

  readonly total = computed(() =>
    this.cart().reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  );

  readonly cartCount = computed(() =>
    this.cart().reduce((sum, i) => sum + i.quantity, 0)
  );

  ngOnInit() {
    const userSites = this.auth.user()?.sites ?? [];
    this.sites.set(userSites);
    if (userSites.length === 1) {
      this.selectedSiteId.set(userSites[0].id);
      this.loadStock();
    }
  }

  onSiteChange() {
    this.cart.set([]);
    this.loadStock();
  }

  loadStock() {
    if (!this.selectedSiteId()) return;
    this.loading.set(true);
    this.api.get<any>(`/stock?site_id=${this.selectedSiteId()}`).subscribe({
      next: (res) => {
        this.stockItems.set(res.data.filter((s: any) => parseFloat(s.quantity) > 0));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addToCart(stockItem: any) {
    const existing = this.cart().find(c => c.product_id === stockItem.product_id);
    if (existing) {
      if (existing.quantity < existing.max_qty) {
        this.cart.update(c => c.map(i =>
          i.product_id === stockItem.product_id ? { ...i, quantity: i.quantity + 1 } : i
        ));
      }
      return;
    }
    const price = parseFloat(stockItem.product.selling_price) || parseFloat(stockItem.product.cost_price) || 0;
    this.cart.update(c => [...c, {
      product_id: stockItem.product_id,
      name:       stockItem.product.name,
      unit:       stockItem.product.unit?.abbreviation || '',
      quantity:   1,
      unit_price: price,
      max_qty:    parseFloat(stockItem.quantity),
    }]);
  }

  updateQty(productId: string, qty: number) {
    this.cart.update(c => c.map(item => {
      if (item.product_id !== productId) return item;
      return { ...item, quantity: Math.max(1, Math.min(Math.floor(qty), item.max_qty)) };
    }));
  }

  updatePrice(productId: string, price: number) {
    this.cart.update(c => c.map(item =>
      item.product_id === productId ? { ...item, unit_price: Math.max(0, price) } : item
    ));
  }

  removeFromCart(productId: string) {
    this.cart.update(c => c.filter(i => i.product_id !== productId));
  }

  clearCart() {
    this.cart.set([]);
    this.note.set('');
    this.errors.set([]);
  }

  newSale() {
    this.lastSale.set(null);
    this.success.set(false);
    this.errors.set([]);
  }

  printTicket() {
    const sale = this.lastSale();
    if (!sale) return;

    const PM_LABELS: Record<string, string> = {
      especes: 'Espèces', mobile_money: 'Mobile Money',
      carte: 'Carte bancaire', cheque: 'Chèque',
    };

    const date = new Date(sale.created_at).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const rows = (sale.items ?? []).map((it: any) => `
      <tr>
        <td class="desc">${it.product?.name ?? ''}</td>
        <td class="num">${Number(it.quantity).toLocaleString('fr-FR')} ${it.product?.unit?.abbreviation ?? ''}</td>
        <td class="num">${Number(it.unit_price).toLocaleString('fr-FR')}</td>
        <td class="num">${Number(it.subtotal).toLocaleString('fr-FR')}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Ticket ${sale.reference}</title>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;font-size:12px;width:80mm;padding:5mm;color:#000}
  .c{text-align:center}.b{font-weight:bold}
  .sep{border-top:1px dashed #000;margin:6px 0}
  table{width:100%;border-collapse:collapse}
  td{padding:2px 0;vertical-align:top;white-space:nowrap}
  .desc{width:42%;white-space:normal}
  .num{text-align:right}
  .tot td{font-weight:bold;font-size:14px;padding-top:6px}
  .foot{margin-top:10px;text-align:center;font-size:11px}
  @media print{@page{margin:0;size:80mm auto}body{width:80mm}}
</style>
</head>
<body>
  <div class="c b" style="font-size:16px;margin-bottom:2px">NexaStock</div>
  <div class="c" style="font-size:11px;margin-bottom:6px">${sale.site?.name ?? ''}</div>
  <div class="sep"></div>
  <div>Réf.&nbsp;: <span class="b">${sale.reference}</span></div>
  <div>Date&nbsp;: ${date}</div>
  <div>Caissier&nbsp;: ${sale.cashier?.first_name ?? ''} ${sale.cashier?.last_name ?? ''}</div>
  <div class="sep"></div>
  <table>
    <thead><tr>
      <td class="b desc">Article</td>
      <td class="b num">Qté</td>
      <td class="b num">P.U.</td>
      <td class="b num">S/Total</td>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="sep"></div>
  <table><tr class="tot">
    <td colspan="3">TOTAL</td>
    <td class="num">${Number(sale.total_amount).toLocaleString('fr-FR')}&nbsp;F</td>
  </tr></table>
  <div style="margin-top:6px">Paiement&nbsp;: <span class="b">${PM_LABELS[sale.payment_method] ?? sale.payment_method}</span></div>
  ${sale.note ? `<div style="margin-top:4px;font-size:11px">Note&nbsp;: ${sale.note}</div>` : ''}
  <div class="sep"></div>
  <div class="c" style="margin:8px 0">
    <svg id="barcode"></svg>
  </div>
  <div class="foot">Merci pour votre achat !<br>Conservez ce ticket.</div>
  <script>
    JsBarcode('#barcode', '${sale.reference}', {
      format: 'CODE128', width: 1, height: 36,
      displayValue: true, fontSize: 10, margin: 0,
      font: 'Courier New', textMargin: 3
    });
    var svg = document.getElementById('barcode');
    svg.setAttribute('width', '160');
    svg.removeAttribute('height');
    svg.style.height = 'auto';
  <\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=440,height=620');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  }

  submit() {
    if (!this.selectedSiteId() || this.cart().length === 0) return;
    this.saving.set(true);
    this.errors.set([]);

    this.salesService.create({
      site_id:        this.selectedSiteId(),
      payment_method: this.paymentMethod(),
      note:           this.note(),
      items: this.cart().map(i => ({
        product_id: i.product_id,
        quantity:   i.quantity,
        unit_price: i.unit_price,
      })),
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.success.set(true);
        this.lastSale.set(res.data);
        this.cart.set([]);
        this.note.set('');
        this.loadStock();
      },
      error: (err) => {
        const body = err.error ?? {};
        this.errors.set([body.message ?? 'Erreur lors de la vente']);
        this.saving.set(false);
      },
    });
  }
}
