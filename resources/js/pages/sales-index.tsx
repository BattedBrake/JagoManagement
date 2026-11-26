import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowUpDown, Eye, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Penjualan', href: '/sales' }];
const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

type Sale = { id: number; receipt_number: string; sold_at: string; item_name: string; type: string; brand: string; quantity: number; purchase_price: number; selling_price: number; profit: number };
type PageLink = { url: string | null; label: string; active: boolean };
type Props = {
    sales: { data: Sale[]; links: PageLink[]; from: number | null; to: number | null; total: number };
    summary: { month: string; transaction_count: number; sold_units: number; profit: number };
    filters: { search: string; month: string; sort: string; direction: string };
};

export default function SalesIndex({ sales, summary, filters }: Props) {
    const [filter, setFilter] = useState(filters);
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
    const { delete: destroy, processing: deleting } = useForm();

    function submit(event: FormEvent) {
        event.preventDefault();
        router.get(route('sales.index'), { search: filter.search || undefined, month: filter.month || undefined, sort: filter.sort, direction: filter.direction }, { preserveState: true, replace: true });
    }

    function sortByReceiptNumber() {
        const nextDirection = filter.sort === 'receipt_number' && filter.direction === 'asc' ? 'desc' : 'asc';
        const nextFilter = { ...filter, sort: 'receipt_number', direction: nextDirection };

        setFilter(nextFilter);
        router.get(route('sales.index'), { search: nextFilter.search || undefined, month: nextFilter.month || undefined, sort: nextFilter.sort, direction: nextFilter.direction }, { preserveState: true, replace: true });
    }

    function deleteSale() {
        if (!saleToDelete) {
            return;
        }

        destroy(route('sales.destroy', saleToDelete.id), {
            preserveScroll: true,
            onSuccess: () => setSaleToDelete(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penjualan" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Penjualan</h1>
                        <p className="text-sm text-muted-foreground">Transaksi keluar stok dan laba per nota.</p>
                    </div>
                    <Button asChild><Link href={route('sales.create')}><Plus className="size-4" /> Catat penjualan</Link></Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Card className="rounded-md"><CardHeader><CardTitle className="text-sm text-muted-foreground">Transaksi bulan ini</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{summary.transaction_count}</div></CardContent></Card>
                    <Card className="rounded-md"><CardHeader><CardTitle className="text-sm text-muted-foreground">Unit terjual</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{summary.sold_units}</div></CardContent></Card>
                    <Card className="rounded-md"><CardHeader><CardTitle className="text-sm text-muted-foreground">Laba</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{money(summary.profit)}</div></CardContent></Card>
                </div>

                <Card className="rounded-md">
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="search" value={filter.search} onChange={(event) => setFilter({ ...filter, search: event.target.value })} className="pl-9" placeholder="No nota, barang, merk" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="month">Bulan</Label>
                                <Input id="month" type="month" value={filter.month} onChange={(event) => setFilter({ ...filter, month: event.target.value })} />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full">Filter</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="rounded-md">
                    <CardHeader><CardTitle className="text-base">Daftar penjualan</CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead className="border-b text-left text-muted-foreground">
                                <tr>
                                    <th className="py-3 font-medium">
                                        <button type="button" onClick={sortByReceiptNumber} className="inline-flex items-center gap-1 hover:text-foreground">
                                            No nota <ArrowUpDown className="size-3.5" />
                                        </button>
                                    </th>
                                    <th className="py-3 font-medium">Tanggal</th>
                                    <th className="py-3 font-medium">Barang</th>
                                    <th className="py-3 text-right font-medium">Qty</th>
                                    <th className="py-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.data.map((sale) => (
                                    <tr key={sale.id} className="border-b last:border-0">
                                        <td className="py-3 font-medium">{sale.receipt_number}</td>
                                        <td className="py-3">{sale.sold_at}</td>
                                        <td className="py-3">{sale.type} {sale.brand} {sale.item_name}</td>
                                        <td className="py-3 text-right">{sale.quantity}</td>
                                        <td className="py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-8">
                                                        <MoreHorizontal className="size-4" />
                                                        <span className="sr-only">Aksi</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('sales.show', sale.id)}>
                                                            <Eye className="size-4" /> View lebih lanjut
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setSaleToDelete(sale)}>
                                                        <Trash2 className="size-4" /> Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {sales.data.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Belum ada penjualan di filter ini.</td></tr>}
                            </tbody>
                        </table>
                        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                            <span>{sales.from ?? 0}-{sales.to ?? 0} dari {sales.total} transaksi</span>
                            <div className="flex flex-wrap gap-2">
                                {sales.links.map((link, index) => (
                                    <Button key={`${link.label}-${index}`} asChild={!!link.url} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}>
                                        {link.url ? <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={!!saleToDelete} onOpenChange={(open) => !open && setSaleToDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus penjualan?</DialogTitle>
                            <DialogDescription>
                                Penjualan nota {saleToDelete?.receipt_number} akan dihapus dan stok barang akan dikembalikan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                            <Button variant="destructive" onClick={deleteSale} disabled={deleting}>Ya, hapus</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
