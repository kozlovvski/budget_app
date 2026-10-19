import assert from 'node:assert/strict';
import { test } from 'node:test';
import { diff, fieldShare, type Fetch, type Tx } from './eb.ts';

const fetchOf = (txs: Tx[]): Fetch => ({
  at: '',
  bank: 'Bank',
  strategy: 'default',
  mode: 'unattended',
  calls: [
    {
      at: '',
      method: 'GET',
      path: '/accounts/acc1/transactions?strategy=default',
      status: 200,
      ms: 0,
      body: { transactions: txs },
    },
  ],
});

test('diff pairs by identifier and skips items that aged out of the window', () => {
  const aged = { entry_reference: 'old', status: 'BOOK', booking_date: '2026-09-01' };
  const pending = { entry_reference: 'p1', status: 'PDNG', transaction_date: '2026-10-01' };
  const dropped = { entry_reference: 'g1', status: 'PDNG', transaction_date: '2026-10-03' };
  const kept = { entry_reference: 'k1', status: 'BOOK', booking_date: '2026-10-02' };
  const added = { entry_reference: 'n1', status: 'BOOK', booking_date: '2026-10-04' };
  const booked = { ...pending, status: 'BOOK', booking_date: '2026-10-03' };

  const d = diff(fetchOf([aged, pending, dropped, kept]), fetchOf([booked, kept, kept, added]));

  assert.deepEqual(
    d.added.map((t) => t.entry_reference),
    ['n1'],
  );
  assert.deepEqual(
    d.gone.map((t) => t.entry_reference),
    ['g1'],
  );
  assert.deepEqual(d.changed, [
    { key: 'p1', fields: { status: ['PDNG', 'BOOK'], booking_date: [undefined, '2026-10-03'] } },
  ]);
  assert.deepEqual(d.duplicates, [{ key: 'k1', count: 2 }]);
});

test('fieldShare gives the share of transactions with each field filled', () => {
  const txs = [
    { creditor: { name: 'Shop' }, remittance_information: ['Card payment'] },
    { creditor: null, remittance_information: [] },
  ];
  assert.deepEqual(fieldShare(txs), { 'creditor.name': 50, remittance_information: 50 });
});
