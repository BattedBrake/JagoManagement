import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, PackagePlus, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Semua Barang', href: '/inventory' }];
const money = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

type Brand = { id: number; name: string };
type Item = { id: number; name: string; type: string; brand: string; stock: number; profit_per_unit: number };
type PageLink = { url: string | null; label: string; active: boolean };
type Props = {
    items: { data: Item[]; links: PageLink[]; from: number | null; to: number | null; total: number };
    filters: { search: string; brand: string; type: string; stock: string };
    brands: Brand[];
    types: string[];
};

export default function InventoryIndex({ items, filters, brands, types }: Props) {
    const [filter, setFilter] = useState(filters);

    function submit(event: FormEvent) {
        event.preventDefault();
        router.get(
            route('inventory.index'),
            {
                search: filter.search || undefined,
                brand: filter.brand === 'all' ? undefined : filter.brand,
                type: filter.type === 'all' ? undefined : filter.type,
                stock: filter.stock === 'all' ? undefined : filter.stock,
            },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Semua Barang" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Semua barang</h1>
                        <p className="text-sm text-muted-foreground">Cari, filter, dan cek stok terkini dari master barang.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('inventory.create')}>
                            <PackagePlus className="size-4" /> Tambah barang
                        </Link>
                    </Button>
                </div>

                <Card className="rounded-md">
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[1fr_180px_180px_150px_auto]">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="search" value={filter.search} onChange={(event) => setFilter({ ...filter, search: event.target.value })} className="pl-9" placeholder="Nama, merk, tipe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Merk</Label>
                                <Select value={filter.brand} onValueChange={(value) => setFilter({ ...filter, brand: value })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua merk</SelectItem>
                                        {brands.map((brand) => <SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tipe</Label>
                                <Select value={filter.type} onValueChange={(value) => setFilter({ ...filter, type: value })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua tipe</SelectItem>
                                        {types.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Stok</Label>
                                <Select value={filter.stock} onValueChange={(value) => setFilter({ ...filter, stock: value })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="low">Menipis</SelectItem>
                                        <SelectItem value="empty">Kosong</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full">Filter</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="rounded-md">
                    <CardHeader><CardTitle className="text-base">Daftar barang</CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead className="border-b text-left text-muted-foreground">
                                <tr>
                                    <th className="py-3 font-medium">Tipe</th>
                                    <th className="py-3 font-medium">Merk</th>
                                    <th className="py-3 font-medium">Nama</th>
                                    <th className="py-3 text-right font-medium">Stok</th>
                                    <th className="py-3 text-right font-medium">Laba/unit</th>
                                    <th className="py-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.data.map((item) => (
                                    <tr key={item.id} className="border-b last:border-0">
                                        <td className="py-3 font-medium">{item.type}</td>
                                        <td className="py-3">{item.brand}</td>
                                        <td className="py-3">{item.name}</td>
                                        <td className="py-3 text-right"><Badge variant={item.stock <= 0 ? 'destructive' : item.stock <= 2 ? 'secondary' : 'outline'}>{item.stock}</Badge></td>
                                        <td className="py-3 text-right">{money(item.profit_per_unit)}</td>
                                        <td className="py-3 text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={route('inventory.show', item.id)}><Eye className="size-4" /> Detail</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {items.data.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Belum ada barang yang cocok.</td></tr>}
                            </tbody>
                        </table>
                        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                            <span>{items.from ?? 0}-{items.to ?? 0} dari {items.total} barang</span>
                            <div className="flex flex-wrap gap-2">
                                {items.links.map((link, index) => (
                                    <Button key={`${link.label}-${index}`} asChild={!!link.url} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}>
                                        {link.url ? <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
