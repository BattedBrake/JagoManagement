import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpDown, PackagePlus, ReceiptText } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Beranda', href: '/dashboard' }];

type Sale = {
    id: number;
    receipt_number: string;
    sold_at: string;
    item_name: string;
    type?: string;
    brand_name: string;
    quantity: number;
    profit: number;
};

type Props = {
    recentSales: Sale[];
};

const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export default function Dashboard({ recentSales }: Props) {
    const [receiptDirection, setReceiptDirection] = useState<'asc' | 'desc'>('asc');
    const sortedSales = useMemo(() => {
        return [...recentSales].sort((first, second) => {
            const result = first.receipt_number.localeCompare(second.receipt_number, 'id', { numeric: true });

            return receiptDirection === 'asc' ? result : -result;
        });
    }, [recentSales, receiptDirection]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Beranda" />
            <div className="flex flex-1 flex-col gap-5 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 p-4 md:p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="flex flex-col gap-3 rounded-md border bg-white/80 p-5 shadow-sm md:flex-row md:items-end md:justify-between dark:bg-slate-950/70">
                    <div>
                        <h1 className="text-2xl font-semibold">Jago Stok</h1>
                        <p className="text-sm text-muted-foreground">Pantau transaksi terbaru dan lanjutkan pekerjaan harian dari sini.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('inventory.create')}><PackagePlus className="size-4" /> Tambah barang</Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('sales.create')}><ReceiptText className="size-4" /> Catat penjualan</Link>
                        </Button>
                    </div>
                </div>

                <Card className="rounded-md bg-white/90 shadow-sm dark:bg-slate-950/80">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Penjualan terbaru</CardTitle>
                            <p className="text-sm text-muted-foreground">Transaksi terakhir yang sudah mengurangi stok.</p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('sales.index')}>
                                Lihat semua <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-sm">
                            <thead className="border-b text-left text-muted-foreground">
                                <tr>
                                    <th className="py-3 font-medium">
                                        <button type="button" onClick={() => setReceiptDirection(receiptDirection === 'asc' ? 'desc' : 'asc')} className="inline-flex items-center gap-1 hover:text-foreground">
                                            Nota <ArrowUpDown className="size-3.5" />
                                        </button>
                                    </th>
                                    <th className="py-3 font-medium">Tanggal</th>
                                    <th className="py-3 font-medium">Barang</th>
                                    <th className="py-3 text-right font-medium">Qty</th>
                                    <th className="py-3 text-right font-medium">Laba</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSales.map((sale) => (
                                    <tr key={sale.id} className="border-b last:border-0">
                                        <td className="py-3 font-medium">{sale.receipt_number}</td>
                                        <td className="py-3">{sale.sold_at}</td>
                                        <td className="py-3">
                                            {[sale.type, sale.brand_name, sale.item_name].filter(Boolean).join(' - ')}
                                        </td>
                                        <td className="py-3 text-right">{sale.quantity}</td>
                                        <td className="py-3 text-right font-medium">{money(sale.profit)}</td>
                                    </tr>
                                ))}
                                {recentSales.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-muted-foreground">
                                            Belum ada penjualan. Catat penjualan pertama untuk mulai melihat riwayat di sini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
