import { SvgColor } from 'src/components/svg-color';

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Products',
    path: '/products',
    icon: icon('ic-cart'),
  },
  {
    title: 'Categories',
    path: '/categories',
    icon: icon('ic-blog'),
  },
  {
    title: 'Subcategories',
    path: '/subcategories',
    icon: icon('ic-blog'),
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: icon('ic-user'),
  },
  {
    title: 'Banners',
    path: '/banners',
    icon: icon('ic-blog'),
  },
];
