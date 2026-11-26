import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowUpDown, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';

const money = (value: number | null) => value === null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

type Item = { id: number; name: string; type: string; brand: string; stock: number; purchase_price: number; selling_price: number; profit_per_unit: number; created_at: string };
type Movement = { id: number; receipt_number: string | null; type: 'in' | 'out' | 'sale'; quantity: number; purchase_price: number | null; selling_price: number | null; notes: string | null; happened_at: string };
type Props = { item: Item; movements: Movement[]; movementSort: { sort: string; direction: string } };

export default function InventoryShow({ item, movements, movementSort }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Semua Barang', href: '/inventory' },
        { title: `${item.type} - ${item.brand} - ${item.name}`, href: `/inventory/${item.id}` },
    ];
    const { data, setData, post, processing, errors, reset } = useForm({ type: 'in', quantity: '1', receipt_number: '', notes: '' });
    const { delete: destroy, processing: deleting, errors: deleteErrors } = useForm();

    function submit(event: FormEvent) {
        event.preventDefault();
        post(route('inventory.movement', item.id), { onSuccess: () => reset('quantity', 'receipt_number', 'notes') });
    }

    function deleteItem() {
        destroy(route('inventory.destroy', item.id), { preserveScroll: true });
    }

    function sortMovementsByReceiptNumber() {
        const nextDirection = movementSort.sort === 'receipt_number' && movementSort.direction === 'asc' ? 'desc' : 'asc';

        router.get(
            route('inventory.show', item.id),
            { movement_sort: 'receipt_number', movement_direction: nextDirection },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail ${item.type} - ${item.brand} - ${item.name}`} />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{item.type} - {item.brand} - {item.name}</h1>
                        <p className="text-sm text-muted-foreground">Dibuat {item.created_at}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline"><Link href={route('inventory.index')}>Kembali</Link></Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="size-4" /> Hapus</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Hapus barang?</DialogTitle>
                                    <DialogDescription>
                                        Barang {item.type} - {item.brand} - {item.name} akan dihapus dari daftar stok. Aksi ini tidak bisa dibatalkan.
                                    </DialogDescription>
                                </DialogHeader>
                                {deleteErrors.delete && <InputError message={deleteErrors.delete} />}
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                                    <Button variant="destructive" onClick={deleteItem} disabled={deleting}>Hapus barang</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="rounded-md"><CardHeader><CardTitle className="text-sm text-muted-foreground">Stok sekarang</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{item.stock}</div></CardContent></Card>
                    <Card className="rounded-md"><CardHeader><CardTitle className="text-sm text-muted-foreground">Harga beli</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{money(item.purchase_price)}</div></CardContent></Card>
                    <Card className="rounded-md"><CardHeader><CardTitle className="text-sm text-muted-foreground">Harga jual</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{money(item.selling_price)}</div></CardContent></Card>
                    <Card className="rounded-md"><CardHeader><CardTitle className="text-sm text-muted-foreground">Laba/unit</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{money(item.profit_per_unit)}</div></CardContent></Card>
                </div>

                <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
                    <Card className="rounded-md">
                        <CardHeader><CardTitle className="text-base">Tambah / kurang stok</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Jenis</Label>
                                    <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="in">Tambah stok</SelectItem>
                                            <SelectItem value="out">Kurang stok</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Jumlah</Label>
                                    <Input id="quantity" type="number" min="1" value={data.quantity} onChange={(event) => setData('quantity', event.target.value)} />
                                    <InputError message={errors.quantity} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receipt_number">No nota</Label>
                                    <Input id="receipt_number" value={data.receipt_number} onChange={(event) => setData('receipt_number', event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Catatan</Label>
                                    <Input id="notes" value={data.notes} onChange={(event) => setData('notes', event.target.value)} />
                                </div>
                                <Button type="submit" disabled={processing} className="w-full">Simpan perubahan stok</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-md">
                        <CardHeader><CardTitle className="text-base">Riwayat stok</CardTitle></CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead className="border-b text-left text-muted-foreground">
                                    <tr>
                                        <th className="py-3 font-medium">Tanggal</th>
                                        <th className="py-3 font-medium">
                                            <button type="button" onClick={sortMovementsByReceiptNumber} className="inline-flex items-center gap-1 hover:text-foreground">
                                                No nota <ArrowUpDown className="size-3.5" />
                                            </button>
                                        </th>
                                        <th className="py-3 font-medium">Jenis</th>
                                        <th className="py-3 text-right font-medium">Qty</th>
                                        <th className="py-3 text-right font-medium">Harga jual</th>
                                        <th className="py-3 font-medium">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map((movement) => (
                                        <tr key={movement.id} className="border-b last:border-0">
                                            <td className="py-3">{movement.happened_at}</td>
                                            <td className="py-3 font-medium">{movement.receipt_number ?? '-'}</td>
                                            <td className="py-3"><Badge variant={movement.type === 'out' ? 'secondary' : movement.type === 'sale' ? 'default' : 'outline'}>{movement.type}</Badge></td>
                                            <td className="py-3 text-right">{movement.quantity}</td>
                                            <td className="py-3 text-right">{money(movement.selling_price)}</td>
                                            <td className="py-3">{movement.notes ?? '-'}</td>
                                        </tr>
                                    ))}
                                    {movements.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Belum ada riwayat stok.</td></tr>}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-md border-destructive/30">
                    <CardHeader>
                        <CardTitle className="text-base text-destructive">Hapus barang</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Gunakan ini hanya kalau barang memang salah input. Barang yang sudah punya riwayat penjualan tidak bisa dihapus langsung.
                        </p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="size-4" /> Hapus barang</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Hapus barang?</DialogTitle>
                                    <DialogDescription>
                                        Konfirmasi untuk menghapus {item.type} - {item.brand} - {item.name}.
                                    </DialogDescription>
                                </DialogHeader>
                                {deleteErrors.delete && <InputError message={deleteErrors.delete} />}
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                                    <Button variant="destructive" onClick={deleteItem} disabled={deleting}>Ya, hapus</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
