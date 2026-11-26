import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BarChart3, Home, Package, PackagePlus, ReceiptText } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Beranda',
        url: '/dashboard',
        icon: Home,
    },
    {
        title: 'Semua Barang',
        url: '/inventory',
        icon: Package,
    },
    {
        title: 'Tambah Barang',
        url: '/inventory/create',
        icon: PackagePlus,
    },
    {
        title: 'Penjualan',
        url: '/sales',
        icon: BarChart3,
    },
    {
        title: 'Catat Penjualan',
        url: '/sales/create',
        icon: ReceiptText,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="flex items-center justify-between px-2 py-1 text-sm text-muted-foreground group-data-[collapsible=icon]:justify-center">
                    <span className="group-data-[collapsible=icon]:hidden">Tema</span>
                    <AppearanceToggleDropdown />
                </div>
                {footerNavItems.length > 0 && <NavFooter items={footerNavItems} className="mt-auto" />}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
