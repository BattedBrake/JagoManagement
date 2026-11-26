import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, ReceiptText, Trash2 } from 'lucide-react';

const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

type Sale = {
    id: number;
    receipt_number: string;
    sold_at: string;
    quantity: number;
    purchase_price: number;
    selling_price: number;
    profit: number;
    item: {
        id: number;
        name: string;
        type: string;
        brand: string;
        stock: number;
    };
};

type Props = { sale: Sale };

export default function SalesShow({ sale }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Penjualan', href: '/sales' },
        { title: sale.receipt_number, href: `/sales/${sale.id}` },
    ];
    const { delete: destroy, processing } = useForm();
    const itemLabel = `${sale.item.type} ${sale.item.brand} ${sale.item.name}`;

    function deleteSale() {
        destroy(route('sales.destroy', sale.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail ${sale.receipt_number}`} />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div className="flex flex-col gap-3 rounded-md border bg-white/80 p-5 shadow-sm md:flex-row md:items-end md:justify-between dark:bg-slate-950/70">
                    <div>
                        <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                            <ReceiptText className="size-3.5" /> Nota {sale.receipt_number}
                        </p>
                        <h1 className="text-2xl font-semibold">{itemLabel}</h1>
                        <p className="text-sm text-muted-foreground">Tanggal jual {sale.sold_at} - jumlah {sale.quantity} unit.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={route('sales.index')}><ArrowLeft className="size-4" /> Kembali</Link>
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Card className="rounded-md">
                        <CardHeader><CardTitle className="text-sm text-muted-foreground">Harga beli/unit</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-semibold">{money(sale.purchase_price)}</div></CardContent>
                    </Card>
                    <Card className="rounded-md">
                        <CardHeader><CardTitle className="text-sm text-muted-foreground">Harga jual/unit</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-semibold">{money(sale.selling_price)}</div></CardContent>
                    </Card>
                    <Card className="rounded-md">
                        <CardHeader><CardTitle className="text-sm text-muted-foreground">Laba nota</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-semibold">{money(sale.profit)}</div></CardContent>
                    </Card>
                </div>

                <Card className="rounded-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Package className="size-4" /> Rincian transaksi</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 text-sm md:grid-cols-2">
                        <div className="rounded-md border bg-muted/40 p-4">
                            <p className="text-muted-foreground">Barang</p>
                            <p className="mt-1 font-medium">{itemLabel}</p>
                        </div>
                        <div className="rounded-md border bg-muted/40 p-4">
                            <p className="text-muted-foreground">Stok setelah transaksi</p>
                            <p className="mt-1 font-medium">{sale.item.stock}</p>
                        </div>
                        <div className="rounded-md border bg-muted/40 p-4">
                            <p className="text-muted-foreground">Total modal</p>
                            <p className="mt-1 font-medium">{money(sale.purchase_price * sale.quantity)}</p>
                        </div>
                        <div className="rounded-md border bg-muted/40 p-4">
                            <p className="text-muted-foreground">Total jual</p>
                            <p className="mt-1 font-medium">{money(sale.selling_price * sale.quantity)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-md border-destructive/30">
                    <CardHeader>
                        <CardTitle className="text-base text-destructive">Hapus penjualan</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Jika transaksi ini dihapus, stok barang akan dikembalikan sebanyak {sale.quantity} unit.
                        </p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="size-4" /> Hapus penjualan</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Hapus penjualan?</DialogTitle>
                                    <DialogDescription>
                                        Nota {sale.receipt_number} akan dihapus dan stok {itemLabel} akan dikembalikan.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                                    <Button variant="destructive" onClick={deleteSale} disabled={processing}>Ya, hapus</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
